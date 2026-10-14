import {afterEach, describe, expect, it, vi} from 'vitest';
import type {PrinterInput} from '../model/types';
import {printerApi} from './printer-api';

const input: PrinterInput = {
    asset_number: 42,
    model: 'LaserJet',
    ip: '192.168.1.100',
    machine_condition: null,
    branch_id: 1,
    departments_id: 2,
};
const printer = {...input, id: 7, created_at: '2026-09-13T12:00:00Z'};
const {signal} = new AbortController();

function mockResponse(body: unknown, status = 200) {
    const fetchMock = vi
        .fn()
        .mockImplementation(async () => Response.json(body, {status}));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('printer API contract', () => {
    it('reads the paginated collection and forwards cancellation', async () => {
        const request = mockResponse({
            content: [printer],
            paging: {has_next: false},
        });
        await expect(printerApi.list({kind: 'all'}, signal)).resolves.toEqual([
            printer,
        ]);
        expect(request).toHaveBeenCalledWith(
            '/api/printers?page=0&page_size=100',
            expect.objectContaining({signal}),
        );
    });

    it('uses the ID route and wraps a single result', async () => {
        const request = mockResponse(printer);
        await expect(
            printerApi.list({kind: 'id', value: '7'}, signal),
        ).resolves.toEqual([printer]);
        expect(request).toHaveBeenCalledWith(
            '/api/printers/7',
            expect.objectContaining({signal}),
        );
    });

    it('treats only an ID 404 as an empty search result', async () => {
        mockResponse(
            {message: 'Printer not found by id', code: 'PRINTER_001'},
            404,
        );
        await expect(
            printerApi.list({kind: 'id', value: '7'}, signal),
        ).resolves.toEqual([]);
        await expect(printerApi.list({kind: 'all'}, signal)).rejects.toThrow(
            'Printer not found by id',
        );
    });

    it('preserves server errors', async () => {
        mockResponse({message: 'Unexpected error', code: 'CORE_003'}, 500);
        await expect(
            printerApi.list({kind: 'id', value: '7'}, signal),
        ).rejects.toThrow('Unexpected error');
    });

    it('sends create, update, and deactivation to the REST routes', async () => {
        const request = mockResponse(printer);
        await printerApi.create(input);
        await printerApi.update(7, input);
        await printerApi.deactivate(7);
        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/printers',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(input),
            }),
        );
        expect(request).toHaveBeenNthCalledWith(
            2,
            '/api/printers/7',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(input),
            }),
        );
        expect(request).toHaveBeenNthCalledWith(
            3,
            '/api/printers/7',
            expect.objectContaining({method: 'DELETE'}),
        );
        const options = request.mock.calls[0]?.[1] as RequestInit;
        expect(new Headers(options.headers).get('Content-Type')).toBe(
            'application/json',
        );
    });
});
