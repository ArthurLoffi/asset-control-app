import type {Monitor, MonitorInput, MonitorSearch} from '../model/types.js';
import {employeeApi} from '@/entities/employee/index.js';
import {apiRequest} from '@/shared/api/index.js';

export const monitorApi = {
    async list(search: MonitorSearch, signal: AbortSignal): Promise<Monitor[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Monitor[] | undefined>('/monitors', {
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
                employeeIds.map(async (employeeId) => {
                    const query = new URLSearchParams({
                        employee_id: String(employeeId),
                    });
                    return (
                        (await apiRequest<Monitor[] | undefined>(
                            `/monitors/employee_id?${query.toString()}`,
                            {signal},
                        )) ?? []
                    );
                }),
            );
            return results.flat();
        }

        const query = new URLSearchParams({id: search.value});
        const monitor = await apiRequest<Monitor>(
            `/monitors/id?${query.toString()}`,
            {signal},
        );
        return [monitor];
    },
    async create(input: MonitorInput): Promise<void> {
        await apiRequest<Monitor>('/monitors', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },
    async update(id: number, input: MonitorInput): Promise<void> {
        await apiRequest<Monitor>(`/monitors?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    },
};
