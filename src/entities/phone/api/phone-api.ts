import type {Phone, PhoneInput, PhoneSearch} from '../model/types';
import {employeeApi} from '@/entities';
import {
    ApiError,
    apiRequest,
    createResourceWriter,
    uniqueRecordsById,
} from '@/shared';

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
            return uniqueRecordsById(results.flat());
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

    ...createResourceWriter<Phone, PhoneInput>('/phones'),
};
