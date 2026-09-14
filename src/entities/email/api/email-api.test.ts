import {afterEach, describe, expect, it, vi} from 'vitest';
import type {EmailInput} from '../model/types';
import {emailApi} from './email-api';

const input: EmailInput = {
    user: 'Ana [Ops]',
    email: 'ana@example.com',
    password_hash: ' plain<&>text ',
};
const email = {...input, id: 42, created_at: '2026-09-14T12:00:00Z'};
const {signal} = new AbortController();

function mockResponse(body: unknown, status = 200) {
    const request = vi
        .fn()
        .mockImplementation(async () => Response.json(body, {status}));
    vi.stubGlobal('fetch', request);
    return request;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('email API', () => {
    it('lists all emails and forwards cancellation', async () => {
        const request = mockResponse({data: [email]});
        await expect(emailApi.list({kind: 'all'}, signal)).resolves.toEqual([
            email,
        ]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails',
            expect.objectContaining({signal}),
        );
    });

    it('normalizes an empty collection and preserves list errors', async () => {
        mockResponse({data: null});
        await expect(emailApi.list({kind: 'all'}, signal)).resolves.toEqual([]);
        mockResponse({error: 'List unavailable'}, 404);
        await expect(emailApi.list({kind: 'all'}, signal)).rejects.toThrow(
            'List unavailable',
        );
    });

    it('routes filtered lists through the existing lookup endpoint', async () => {
        const request = mockResponse({data: email});
        await expect(
            emailApi.list({kind: 'id', value: '42'}, signal),
        ).resolves.toEqual([email]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails/id?id=42',
            expect.objectContaining({signal}),
        );
    });
    it('encodes user searches and preserves the stored password', async () => {
        const request = mockResponse({data: email});
        await expect(
            emailApi.find({kind: 'user', value: 'Ana [Ops]&'}, signal),
        ).resolves.toEqual([email]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails/user?user=Ana+%5BOps%5D%26',
            expect.objectContaining({signal}),
        );
    });

    it('uses the ID lookup route', async () => {
        const request = mockResponse({data: email});
        await expect(
            emailApi.find({kind: 'id', value: '42'}, signal),
        ).resolves.toEqual([email]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails/id?id=42',
            expect.objectContaining({signal}),
        );
    });

    it('treats missing matches as empty but preserves server failures', async () => {
        mockResponse({error: 'not found'}, 404);
        await expect(
            emailApi.find({kind: 'user', value: 'missing'}, signal),
        ).resolves.toEqual([]);
        mockResponse({error: 'database operation timed out'}, 504);
        await expect(
            emailApi.find({kind: 'id', value: '42'}, signal),
        ).rejects.toThrow('database operation timed out');
    });

    it('returns saved records and sends unmodified passwords on both write routes', async () => {
        const request = mockResponse({data: email});
        await expect(emailApi.create(input)).resolves.toEqual(email);
        await expect(emailApi.update(42, input)).resolves.toEqual(email);
        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/emails',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(input),
            }),
        );
        expect(request).toHaveBeenNthCalledWith(
            2,
            '/api/emails?id=42',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(input),
            }),
        );
    });

    it('does not swallow write failures', async () => {
        mockResponse({error: 'record not found'}, 404);
        await expect(emailApi.update(42, input)).rejects.toThrow(
            'record not found',
        );
    });
});
