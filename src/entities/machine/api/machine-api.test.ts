import {beforeEach, describe, expect, it, vi} from 'vitest';
import {machineApi} from './machine-api.js';
import {apiRequest} from '@/shared/api/index.js';

vi.mock('@/shared/api/index.js', () => ({
    apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);
const {signal} = new AbortController();

describe('machineApi.list', () => {
    beforeEach(() => {
        mockedApiRequest.mockReset();
    });

    it('loads all machines from the collection route', async () => {
        mockedApiRequest.mockResolvedValue([]);

        await expect(machineApi.list({kind: 'all'}, signal)).resolves.toEqual(
            [],
        );
        expect(mockedApiRequest).toHaveBeenCalledWith('/machines', {signal});
    });

    it('wraps a machine ID result in a list', async () => {
        const machine = {id: 7};
        mockedApiRequest.mockResolvedValue(machine);

        await expect(
            machineApi.list({kind: 'id', value: '7'}, signal),
        ).resolves.toEqual([machine]);
        expect(mockedApiRequest).toHaveBeenCalledWith('/machines/id?id=7', {
            signal,
        });
    });

    it('keeps all results returned for an employee ID', async () => {
        const machines = [{id: 3}, {id: 4}];
        mockedApiRequest.mockResolvedValue(machines);

        await expect(
            machineApi.list({kind: 'employee_id', value: '12'}, signal),
        ).resolves.toEqual(machines);
        expect(mockedApiRequest).toHaveBeenCalledWith(
            '/machines/employee_id?employee_id=12',
            {signal},
        );
    });
});
