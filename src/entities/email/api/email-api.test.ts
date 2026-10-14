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
const page = (content: unknown[]) => ({content, paging: {has_next: false}});

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
        const request = mockResponse(page([email]));
        await expect(emailApi.list({kind: 'all'}, signal)).resolves.toEqual([
            email,
        ]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails?page=0&page_size=100',
            expect.objectContaining({signal}),
        );
    });

    it('preserves list errors', async () => {
        mockResponse({message: 'List unavailable', code: 'CORE_003'}, 500);
        await expect(emailApi.list({kind: 'all'}, signal)).rejects.toThrow(
            'List unavailable',
        );
    });

    it('uses the ID route and the user filter', async () => {
        const request = mockResponse(email);
        await expect(
            emailApi.list({kind: 'id', value: '42'}, signal),
        ).resolves.toEqual([email]);
        expect(request).toHaveBeenCalledWith(
            '/api/emails/42',
            expect.objectContaining({signal}),
        );
        const filtered = mockResponse(page([email]));
        await expect(
            emailApi.find({kind: 'user', value: 'Ana [Ops]&'}, signal),
        ).resolves.toEqual([email]);
        expect(filtered).toHaveBeenCalledWith(
            '/api/emails?page=0&page_size=100&user=Ana+%5BOps%5D%26',
            expect.objectContaining({signal}),
        );
    });

    it('treats a missing ID as empty but preserves server failures', async () => {
        mockResponse(
            {message: 'Email not found by id', code: 'EMAIL_001'},
            404,
        );
        await expect(
            emailApi.find({kind: 'id', value: '42'}, signal),
        ).resolves.toEqual([]);
        mockResponse(
            {message: 'Database operation timed out', code: 'CORE_005'},
            504,
        );
        await expect(
            emailApi.find({kind: 'id', value: '42'}, signal),
        ).rejects.toThrow('Database operation timed out');
    });

    it('returns saved records and sends unmodified passwords on both write routes', async () => {
        const request = mockResponse(email);
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
            '/api/emails/42',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(input),
            }),
        );
    });

    it('does not swallow write failures', async () => {
        mockResponse(
            {message: 'Email not found by id', code: 'EMAIL_001'},
            404,
        );
        await expect(emailApi.update(42, input)).rejects.toThrow(
            'Email not found by id',
        );
    });
});
