import {beforeEach, describe, expect, it, vi} from 'vitest';
import {phoneApi} from './phone-api';
import {ApiError, apiRequest} from '@/shared';

vi.mock(import('@/shared'), async (importOriginal) => ({
    ...(await importOriginal()),
    apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);
const {signal} = new AbortController();

describe('phoneApi.list', () => {
    beforeEach(() => {
        mockedApiRequest.mockReset();
    });

    it('loads all phones from the collection route', async () => {
        mockedApiRequest.mockResolvedValue([]);

        await expect(phoneApi.list({kind: 'all'}, signal)).resolves.toEqual([]);
        expect(mockedApiRequest).toHaveBeenCalledWith('/phones', {signal});
    });

    it('wraps a phone ID result in a list', async () => {
        const phone = {id: 7};
        mockedApiRequest.mockResolvedValue(phone);

        await expect(
            phoneApi.list({kind: 'id', value: '7'}, signal),
        ).resolves.toEqual([phone]);
        expect(mockedApiRequest).toHaveBeenCalledWith('/phones/id?id=7', {
            signal,
        });
    });

    it('keeps all results returned for an employee ID', async () => {
        const phones = [{id: 3}, {id: 4}];
        mockedApiRequest.mockResolvedValue(phones);

        await expect(
            phoneApi.list({kind: 'employee_id', value: '12'}, signal),
        ).resolves.toEqual(phones);
        expect(mockedApiRequest).toHaveBeenCalledWith(
            '/phones/employee_id?employee_id=12',
            {signal},
        );
    });

    it('combines phones for partial, case-insensitive employee matches', async () => {
        mockedApiRequest.mockResolvedValueOnce([
            {id: 12, name: 'Anna Silva'},
            {id: 13, name: 'Joanna Souza'},
            {id: 14, name: 'Carlos Lima'},
        ]);
        mockedApiRequest.mockResolvedValueOnce([{id: 3}, {id: 4}]);
        mockedApiRequest.mockResolvedValueOnce([{id: 5}]);

        await expect(
            phoneApi.list({kind: 'employee_name', value: 'ANNA'}, signal),
        ).resolves.toEqual([{id: 3}, {id: 4}, {id: 5}]);
        expect(mockedApiRequest).toHaveBeenCalledTimes(3);
        expect(mockedApiRequest).toHaveBeenCalledWith(
            '/phones/employee_id?employee_id=12',
            {signal},
        );
        expect(mockedApiRequest).toHaveBeenCalledWith(
            '/phones/employee_id?employee_id=13',
            {signal},
        );
    });

    it('returns no phones when the employee name does not match', async () => {
        mockedApiRequest.mockResolvedValueOnce([{id: 12, name: 'Anna Silva'}]);

        await expect(
            phoneApi.list({kind: 'employee_name', value: 'Carlos'}, signal),
        ).resolves.toEqual([]);
        expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('matches employee names regardless of accents and surrounding spaces', async () => {
        mockedApiRequest.mockResolvedValueOnce([{id: 12, name: 'João Silva'}]);
        mockedApiRequest.mockResolvedValueOnce([{id: 3}]);

        await expect(
            phoneApi.list({kind: 'employee_name', value: '  JOAO  '}, signal),
        ).resolves.toEqual([{id: 3}]);
    });

    it('keeps matching equipment when another employee has none', async () => {
        mockedApiRequest.mockResolvedValueOnce([
            {id: 12, name: 'Anna Silva'},
            {id: 13, name: 'Anna Souza'},
        ]);
        mockedApiRequest.mockRejectedValueOnce(new ApiError('Not found', 404));
        mockedApiRequest.mockResolvedValueOnce([{id: 5}]);

        await expect(
            phoneApi.list({kind: 'employee_name', value: 'Anna'}, signal),
        ).resolves.toEqual([{id: 5}]);
    });

    it('reports server failures instead of showing incomplete search results', async () => {
        mockedApiRequest.mockResolvedValueOnce([{id: 12, name: 'Anna Silva'}]);
        mockedApiRequest.mockRejectedValueOnce(
            new ApiError('Server unavailable', 500),
        );

        await expect(
            phoneApi.list({kind: 'employee_name', value: 'Anna'}, signal),
        ).rejects.toThrow('Server unavailable');
    });
});
