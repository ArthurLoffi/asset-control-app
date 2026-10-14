import {afterEach, describe, expect, it, vi} from 'vitest';
import {loadDashboard} from './use-dashboard';
import {createResourceWriter} from '@/shared';

const page = (content: unknown[]) => ({content, paging: {has_next: false}});
const changesPath = '/api/changes?direction=DESC&page_size=10';
const resourceOf = (path: string) => path.slice(5).split(/[/?]/u, 1)[0];

// Answer each GET by resource; `respond` may override one resource.
function stubApi(respond: (resource: string) => unknown = () => undefined) {
    const request = vi.fn(async (path: string, _options: RequestInit) => {
        const body = await respond(resourceOf(path));
        if (body instanceof Error) {
            return Response.json(
                {message: body.message, code: 'CORE_003'},
                {status: 500},
            );
        }

        return Response.json(body ?? page([]));
    });
    vi.stubGlobal('fetch', request);
    return request;
}

describe('dashboard API loading', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('loads inventory and the recent change feed, then refetches on a later visit', async () => {
        const request = stubApi((resource) =>
            resource === 'employees'
                ? page([{id: 1, branch_id: 2, department_id: 3}])
                : undefined,
        );
        const {signal} = new AbortController();
        const [snapshot] = await loadDashboard('all', signal);
        expect(snapshot.employees).toHaveLength(1);
        expect(snapshot.changes).toEqual([]);
        const paths = request.mock.calls.map(([path]) => path);
        for (const resource of [
            'employees',
            'machines',
            'monitors',
            'phones',
            'printers',
        ]) {
            const call = request.mock.calls.find(
                ([path]) => path === `/api/${resource}?page=0&page_size=100`,
            );
            expect(call?.[1].signal).toBeInstanceOf(AbortSignal);
        }

        expect(paths).toContain('/api/branches?page=0&page_size=100');
        expect(paths).toContain('/api/departments?page=0&page_size=100');
        expect(paths).toContain(changesPath);
        const firstCount = request.mock.calls.length;
        await loadDashboard('all', signal);
        // Organization lists stay cached; inventory and changes reload.
        expect(request.mock.calls.length).toBe(firstCount + 6);
    });

    it('shares an in-flight load when the first caller unmounts', async () => {
        let finishEmployees: () => void = () => undefined;
        // The project's TypeScript target does not include Promise.withResolvers.
        // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
        const employees = new Promise<void>((resolve) => {
            finishEmployees = resolve;
        });
        const request = stubApi(async (resource) => {
            if (resource === 'employees') {
                await employees;
            }

            return undefined;
        });
        const first = new AbortController();
        const firstLoad = loadDashboard('all', first.signal);
        const secondLoad = loadDashboard('all', new AbortController().signal);
        first.abort();
        await expect(firstLoad).rejects.toMatchObject({name: 'AbortError'});
        finishEmployees();
        await expect(secondLoad).resolves.toHaveLength(1);
        expect(
            request.mock.calls.filter(([path]) =>
                path.startsWith('/api/employees'),
            ),
        ).toHaveLength(1);
    });

    it('uses audit entries for recent changes, including edits to older records', async () => {
        stubApi((resource) =>
            resource === 'changes'
                ? page([
                      {
                          id: 'change-1',
                          time: '2026-09-22T12:00:00Z',
                          user_id: 'editor',
                          user_name: 'Ana',
                          resource: 'machine',
                          resource_id: 1,
                          action: 'update',
                          changed_fields: [
                              {field: 'model', before: 'Old', after: 'New'},
                          ],
                      },
                  ])
                : undefined,
        );
        const [snapshot] = await loadDashboard(
            'all',
            new AbortController().signal,
        );
        expect(snapshot.changes).toEqual([
            expect.objectContaining({id: 'change-1', resource_id: 1}),
        ]);
    });

    it('starts a fresh load after a successful inventory mutation', async () => {
        let finishFirst: () => void = () => undefined;
        // The project's TypeScript target does not include Promise.withResolvers.
        // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
        const firstEmployees = new Promise<void>((resolve) => {
            finishFirst = resolve;
        });
        let employeeReads = 0;
        stubApi(async (resource) => {
            if (resource === 'employees') {
                employeeReads++;
                if (employeeReads === 1) {
                    await firstEmployees;
                }

                return page([]);
            }

            return {id: 9};
        });
        const oldLoad = loadDashboard('all', new AbortController().signal);
        await createResourceWriter<{id: number}, Record<string, unknown>>(
            '/machines',
        ).create({});
        const newLoad = loadDashboard('all', new AbortController().signal);
        finishFirst();
        await Promise.allSettled([oldLoad, newLoad]);
        expect(employeeReads).toBe(2);
    });

    it('rejects a failed collection instead of returning partial or fabricated totals', async () => {
        stubApi((resource) =>
            resource === 'phones' ? new Error('Phones unavailable') : undefined,
        );
        await expect(
            loadDashboard('all', new AbortController().signal),
        ).rejects.toThrow('Phones unavailable');
    });

    it('rejects a failed audit feed instead of showing stale recent changes', async () => {
        stubApi((resource) =>
            resource === 'changes'
                ? new Error('Changes unavailable')
                : undefined,
        );
        await expect(
            loadDashboard('all', new AbortController().signal),
        ).rejects.toThrow('Changes unavailable');
    });
});
