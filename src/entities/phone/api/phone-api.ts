import type {Phone, PhoneInput, PhoneSearch} from '../model/types.js';
import {employeeApi} from '@/entities';
import {ApiError, apiRequest} from '@/shared';

export const phoneApi = {
    async list(search: PhoneSearch, signal: AbortSignal): Promise<Phone[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Phone[] | undefined>('/phones', {
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
                    phoneApi.list(
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
                    (await apiRequest<Phone[] | undefined>(
                        `/phones/employee_id?${query.toString()}`,
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

        const phone = await apiRequest<Phone>(
            `/phones/id?${query.toString()}`,
            {
                signal,
            },
        );
        return [phone];
    },

    async create(input: PhoneInput): Promise<void> {
        await apiRequest<Phone>('/phones', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    async update(id: number, input: PhoneInput): Promise<void> {
        await apiRequest<Phone>(`/phones?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    },
};
