import type {Monitor, MonitorInput, MonitorSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {ApiError, apiRequest, createResourceWriter} from '@/shared';

export const monitorApi = {
    async list(search: MonitorSearch, signal: AbortSignal): Promise<Monitor[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Monitor[] | undefined>('/monitors', {
                    signal,
                })) ?? []
            );
        }

        if (search.kind === 'unassigned') {
            return (
                (await apiRequest<Monitor[] | undefined>(
                    '/monitors/unassigned',
                    {signal},
                )) ?? []
            );
        }

        if (search.kind === 'employee_name') {
            const employeeIds = await employeeApi.findIdsByName(
                search.value,
                signal,
            );
            const results = await Promise.all(
                employeeIds.map(async (employeeId) =>
                    monitorApi.list(
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
                    (await apiRequest<Monitor[] | undefined>(
                        `/monitors/employee_id?${query.toString()}`,
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

        const monitor = await apiRequest<Monitor>(
            `/monitors/id?${query.toString()}`,
            {signal},
        );
        return [monitor];
    },

    ...createResourceWriter<Monitor, MonitorInput>('/monitors'),
};
