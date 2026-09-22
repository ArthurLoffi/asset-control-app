import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {loadDashboard} from './use-dashboard';
import {apiRequest, createResourceWriter} from '@/shared';

vi.mock(import('@/shared'), async (importOriginal) => ({
    ...(await importOriginal()),
    apiRequest: vi.fn(),
}));
const request = vi.mocked(apiRequest);

describe('dashboard API loading', () => {
    beforeEach(() => request.mockReset());
    afterEach(() => vi.unstubAllGlobals());

    it('loads inventory and the recent change feed, then refetches on a later visit', async () => {
        request.mockImplementation(async (path) =>
            path === '/employees'
                ? [{id: 1, branch_id: 2, department_id: 3}]
                : [],
        );
        const {signal} = new AbortController();
        const [snapshot] = await loadDashboard('all', signal);
        expect(snapshot.employees).toHaveLength(1);
        expect(snapshot.changes).toEqual([]);
        expect(request).toHaveBeenCalledTimes(8);
        for (const path of [
            '/employees',
            '/machines',
            '/monitors',
            '/phones',
            '/printers',
        ]) {
            const call = request.mock.calls.find(
                ([requestPath]) => requestPath === path,
            );
            expect(call?.[1]?.signal).toBeInstanceOf(AbortSignal);
        }

        expect(request).toHaveBeenCalledWith('/utils/branches');
        expect(request).toHaveBeenCalledWith('/utils/departments');
        expect(
            request.mock.calls.some(
                ([path, options]) =>
                    path === '/changes/recent' &&
                    options?.signal instanceof AbortSignal,
            ),
        ).toBe(true);
        await loadDashboard('all', signal);
        expect(request).toHaveBeenCalledTimes(14);
    });

    it('shares an in-flight load when the first caller unmounts', async () => {
        let finishEmployees: (records: never[]) => void = () => undefined;
        // The project's TypeScript target does not include Promise.withResolvers.
        // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
        const employees = new Promise<never[]>((resolve) => {
            finishEmployees = resolve;
        });
        request.mockImplementation(async (path) => {
            if (path === '/employees') {
                return employees;
            }

            return [];
        });
        const first = new AbortController();
        const firstLoad = loadDashboard('all', first.signal);
        const secondLoad = loadDashboard('all', new AbortController().signal);
        first.abort();
        await expect(firstLoad).rejects.toMatchObject({name: 'AbortError'});
        finishEmployees([]);
        await expect(secondLoad).resolves.toHaveLength(1);
        expect(request).toHaveBeenCalledTimes(6);
    });

    it('uses audit entries for recent changes, including edits to older records', async () => {
        request.mockImplementation(async (path) =>
            path === '/changes/recent'
                ? [
                      {
                          id: 'change-1',
                          time: '2026-09-22T12:00:00Z',
                          user_id: 'editor',
                          user_name: 'Ana',
                          resource: 'machines',
                          resource_id: 1,
                          action: 'update',
                          changed_fields: [
                              {field: 'model', before: 'Old', after: 'New'},
                          ],
                      },
                  ]
                : [],
        );
        const [snapshot] = await loadDashboard(
            'all',
            new AbortController().signal,
        );
        expect(snapshot.changes).toEqual([
            expect.objectContaining({
                id: 'change-1',
                resource_id: 1,
            }),
        ]);
    });

    it('starts a fresh load after a successful inventory mutation', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({data: {id: 9}})),
        );
        let finishFirst: (records: never[]) => void = () => undefined;
        // The project's TypeScript target does not include Promise.withResolvers.
        // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
        const firstEmployees = new Promise<never[]>((resolve) => {
            finishFirst = resolve;
        });
        let employeeReads = 0;
        request.mockImplementation(async (path) => {
            if (path === '/employees') {
                employeeReads++;
                return employeeReads === 1 ? firstEmployees : [];
            }

            return [];
        });
        const oldLoad = loadDashboard('all', new AbortController().signal);
        await createResourceWriter<{id: number}, Record<string, unknown>>(
            '/employees',
        ).create({});
        const newLoad = loadDashboard('all', new AbortController().signal);
        finishFirst([]);
        await Promise.all([oldLoad, newLoad]);
        expect(employeeReads).toBe(2);
    });

    it('rejects a failed collection instead of returning partial or fabricated totals', async () => {
        request.mockImplementation(async (path) => {
            if (path === '/phones') {
                throw new Error('Phones unavailable');
            }

            return [];
        });
        await expect(
            loadDashboard('all', new AbortController().signal),
        ).rejects.toThrow('Phones unavailable');
    });

    it('rejects a failed audit feed instead of showing stale recent changes', async () => {
        request.mockImplementation(async (path) => {
            if (path === '/changes/recent') {
                throw new Error('Changes unavailable');
            }

            return [];
        });
        await expect(
            loadDashboard('all', new AbortController().signal),
        ).rejects.toThrow('Changes unavailable');
    });
});
