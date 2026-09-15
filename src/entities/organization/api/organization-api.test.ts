import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

beforeEach(() => {
    vi.resetModules();
});
afterEach(() => {
    vi.unstubAllGlobals();
});

describe('shared organization lists', () => {
    it('shares concurrent and later reads, sorting lists by name', async () => {
        const items = [
            {id: 2, name: 'Zulu'},
            {id: 1, name: 'Alpha'},
        ];
        const request = vi.fn(async () => Response.json({data: items}));
        vi.stubGlobal('fetch', request);
        const {organizationApi} = await import('./organization-api');
        const {signal} = new AbortController();
        const [first, second] = await Promise.all([
            organizationApi.list(signal),
            organizationApi.list(signal),
        ]);
        const later = await organizationApi.list(signal);
        expect(first.branches).toEqual([items[1], items[0]]);
        expect(first.departments).toEqual([items[1], items[0]]);
        expect(second.branches).toBe(first.branches);
        expect(later.departments).toBe(first.departments);
        expect(request.mock.calls).toHaveLength(2);
        expect(request).toHaveBeenCalledWith(
            '/api/utils/branches',
            expect.anything(),
        );
        expect(request).toHaveBeenCalledWith(
            '/api/utils/departments',
            expect.anything(),
        );
    });

    it('cancels one subscriber while retaining the shared request for another', async () => {
        let finish!: (response: Response) => void;
        // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
        const pending = new Promise<Response>((resolve) => {
            finish = resolve;
        });
        const request = vi.fn(async () => {
            const response = await pending;
            return response.clone();
        });
        vi.stubGlobal('fetch', request);
        const {organizationApi} = await import('./organization-api');
        const controller = new AbortController();
        const cancelled = organizationApi.list(controller.signal);
        const active = organizationApi.list(new AbortController().signal);
        controller.abort();
        await expect(cancelled).rejects.toMatchObject({name: 'AbortError'});
        finish(Response.json({data: [{id: 1, name: 'Office'}]}));
        await expect(active).resolves.toMatchObject({
            branches: [{id: 1, name: 'Office'}],
        });
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('does not start requests for an already cancelled caller', async () => {
        const request = vi.fn();
        vi.stubGlobal('fetch', request);
        const {organizationApi} = await import('./organization-api');
        const controller = new AbortController();
        controller.abort();
        await expect(
            organizationApi.list(controller.signal),
        ).rejects.toMatchObject({name: 'AbortError'});
        expect(request).not.toHaveBeenCalled();
    });

    it('retries only the failed list and keeps successful empty lists', async () => {
        let isFailing = true;
        const request = vi.fn(async (path: string) =>
            isFailing && path.endsWith('/departments')
                ? Response.json(
                      {error: 'Departments unavailable'},
                      {status: 500},
                  )
                : Response.json({data: null}),
        );
        vi.stubGlobal('fetch', request);
        const {organizationApi} = await import('./organization-api');
        const {signal} = new AbortController();
        await expect(organizationApi.list(signal)).rejects.toThrow(
            'Departments unavailable',
        );
        isFailing = false;
        await expect(organizationApi.list(signal)).resolves.toEqual({
            branches: [],
            departments: [],
        });
        await organizationApi.list(signal);
        expect(request.mock.calls.map(([path]) => path)).toEqual([
            '/api/utils/branches',
            '/api/utils/departments',
            '/api/utils/departments',
        ]);
    });
});
