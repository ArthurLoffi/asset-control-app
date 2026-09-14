import type {Machine, MachineInput, MachineSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {ApiError, apiRequest, createResourceWriter} from '@/shared';

export const machineApi = {
    async list(search: MachineSearch, signal: AbortSignal): Promise<Machine[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Machine[] | undefined>('/machines', {
                    signal,
                })) ?? []
            );
        }

        if (search.kind === 'employee_name') {
            const employeeIds = await employeeApi.findIdsByName(
                search.value,
                signal,
            );
            const results = await Promise.all(
                employeeIds.map(async (employeeId) =>
                    machineApi.list(
                        {kind: 'employee_id', value: String(employeeId)},
                        signal,
                    ),
                ),
            );
            return results.flat();
        }

        const query = new URLSearchParams({[search.kind]: search.value});
        if (search.kind === 'employee_id') {
            try {
                return (
                    (await apiRequest<Machine[] | undefined>(
                        `/machines/employee_id?${query.toString()}`,
                        {signal},
                    )) ?? []
                );
            } catch (error) {
                // An employee without equipment must not discard other matches.
                if (error instanceof ApiError && error.status === 404) {
                    return [];
                }

                throw error;
            }
        }

        const machine = await apiRequest<Machine>(
            `/machines/id?${query.toString()}`,
            {signal},
        );
        return [machine];
    },

    ...createResourceWriter<Machine, MachineInput>('/machines'),
};
