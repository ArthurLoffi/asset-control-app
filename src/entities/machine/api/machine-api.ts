import type {Machine, MachineInput, MachineSearch} from '../model/types.js';
import {apiRequest} from '@/shared/api/index.js';

export const machineApi = {
    async list(search: MachineSearch, signal: AbortSignal): Promise<Machine[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Machine[] | undefined>('/machines', {
                    signal,
                })) ?? []
            );
        }

        const query = new URLSearchParams({[search.kind]: search.value});
        if (search.kind === 'employee_id') {
            return (
                (await apiRequest<Machine[] | undefined>(
                    `/machines/employee_id?${query.toString()}`,
                    {signal},
                )) ?? []
            );
        }

        const machine = await apiRequest<Machine>(
            `/machines/id?${query.toString()}`,
            {signal},
        );
        return [machine];
    },

    async create(input: MachineInput): Promise<void> {
        await apiRequest<Machine>('/machines', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    async update(id: number, input: MachineInput): Promise<void> {
        await apiRequest<Machine>(`/machines?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    },
};
