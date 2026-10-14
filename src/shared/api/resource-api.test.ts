import {afterEach, describe, expect, it, vi} from 'vitest';
import {listAll, listEquipment} from './resource-api';

const {signal} = new AbortController();
const page = (content: unknown[], hasNext = false) => ({
    content,
    paging: {has_next: hasNext},
});

function mockPages(...bodies: unknown[]) {
    const request = vi.fn(async (_path: string, _options: RequestInit) =>
        Response.json(bodies.shift() ?? page([])),
    );
    vi.stubGlobal('fetch', request);
    return request;
}

const paths = (request: ReturnType<typeof mockPages>) =>
    request.mock.calls.map(([path]) => path);

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('listAll', () => {
    it('reads every page and repeats array filters', async () => {
        const request = mockPages(page([{id: 1}], true), page([{id: 2}]));
        await expect(
            listAll('/machines', {employee_id: ['3', '4']}, signal),
        ).resolves.toEqual([{id: 1}, {id: 2}]);
        expect(paths(request)).toEqual([
            '/api/machines?page=0&page_size=100&employee_id=3&employee_id=4',
            '/api/machines?page=1&page_size=100&employee_id=3&employee_id=4',
        ]);
        expect(request.mock.calls[0][1].signal).toBe(signal);
    });
});

describe('listEquipment', () => {
    const findEmployeeIds = vi.fn(async () => [12, 13]);

    it('maps each search to one filtered request', async () => {
        const request = mockPages();
        await listEquipment(
            '/monitors',
            {kind: 'all'},
            signal,
            findEmployeeIds,
        );
        await listEquipment(
            '/monitors',
            {kind: 'unassigned'},
            signal,
            findEmployeeIds,
        );
        await listEquipment(
            '/monitors',
            {kind: 'employee_id', value: '7'},
            signal,
            findEmployeeIds,
        );
        await listEquipment(
            '/monitors',
            {kind: 'employee_name', value: 'Anna'},
            signal,
            findEmployeeIds,
        );
        expect(findEmployeeIds).toHaveBeenCalledWith('Anna', signal);
        expect(paths(request)).toEqual([
            '/api/monitors?page=0&page_size=100',
            '/api/monitors?page=0&page_size=100&unassigned=true',
            '/api/monitors?page=0&page_size=100&employee_id=7',
            '/api/monitors?page=0&page_size=100&employee_id=12&employee_id=13',
        ]);
    });

    it('skips the request when no employee matches the name', async () => {
        const request = mockPages();
        await expect(
            listEquipment(
                '/phones',
                {kind: 'employee_name', value: 'Carlos'},
                signal,
                async () => [],
            ),
        ).resolves.toEqual([]);
        expect(request).not.toHaveBeenCalled();
    });

    it('wraps an ID lookup and treats 404 as no result', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({id: 7})),
        );
        await expect(
            listEquipment(
                '/machines',
                {kind: 'id', value: '7'},
                signal,
                findEmployeeIds,
            ),
        ).resolves.toEqual([{id: 7}]);
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                Response.json(
                    {message: 'Machine not found by id', code: 'MACHINE_001'},
                    {status: 404},
                ),
            ),
        );
        await expect(
            listEquipment(
                '/machines',
                {kind: 'id', value: '7'},
                signal,
                findEmployeeIds,
            ),
        ).resolves.toEqual([]);
    });

    it('reports server failures instead of incomplete results', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                Response.json(
                    {message: 'Unexpected error', code: 'CORE_003'},
                    {status: 500},
                ),
            ),
        );
        await expect(
            listEquipment(
                '/machines',
                {kind: 'employee_name', value: 'Anna'},
                signal,
                findEmployeeIds,
            ),
        ).rejects.toThrow('Unexpected error');
    });
});
