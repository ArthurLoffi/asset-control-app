import {beforeEach, describe, expect, it, vi} from 'vitest';
import {loadDashboard} from './use-dashboard';
import {apiRequest} from '@/shared';

vi.mock(import('@/shared'), async (importOriginal) => ({
    ...(await importOriginal()),
    apiRequest: vi.fn(),
}));
const request = vi.mocked(apiRequest);

describe('dashboard API loading', () => {
    beforeEach(() => request.mockReset());

    it('uses seven bulk GETs and cancels inventory reads without cancelling shared lists', async () => {
        request.mockImplementation(async (path) =>
            path === '/employees'
                ? [{id: 1, branch_id: 2, department_id: 3}]
                : [],
        );
        const {signal} = new AbortController();
        const [snapshot] = await loadDashboard('all', signal);
        expect(snapshot.employees).toHaveLength(1);
        expect(request).toHaveBeenCalledTimes(7);
        for (const path of [
            '/employees',
            '/machines',
            '/monitors',
            '/phones',
            '/printers',
        ]) {
            expect(request).toHaveBeenCalledWith(path, {signal});
        }

        expect(request).toHaveBeenCalledWith('/utils/branches');
        expect(request).toHaveBeenCalledWith('/utils/departments');
        await loadDashboard('all', signal);
        expect(request).toHaveBeenCalledTimes(12);
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
});
