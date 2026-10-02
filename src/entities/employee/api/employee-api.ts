import type {
    EmployeeInput,
    EmployeeRecord,
    EmployeeSearch,
} from '../model/types';
import {apiRequest, createResourceWriter} from '@/shared';

type EmployeeResponse = EmployeeRecord;

function normalizeName(value: string): string {
    return value
        .trim()
        .normalize('NFD')
        .replaceAll(/\p{Mark}/gu, '')
        .toLocaleLowerCase();
}

export const employeeApi = {
    async listRecords(signal: AbortSignal): Promise<EmployeeRecord[]> {
        return (
            (await apiRequest<EmployeeRecord[] | undefined>('/employees', {
                signal,
            })) ?? []
        );
    },
    async findIdsByName(name: string, signal: AbortSignal): Promise<number[]> {
        const employees = await employeeApi.listRecords(signal);
        const normalizedName = normalizeName(name);
        if (normalizedName.length === 0) {
            return [];
        }

        return employees
            .filter((employee) =>
                normalizeName(employee.name).includes(normalizedName),
            )
            .map(({id}) => id);
    },
    async list(
        search: EmployeeSearch,
        signal: AbortSignal,
    ): Promise<EmployeeRecord[]> {
        if (search.kind === 'all') {
            return employeeApi.listRecords(signal);
        }

        if (search.kind === 'name') {
            const employees = await employeeApi.listRecords(signal);
            const normalizedName = normalizeName(search.value);

            return employees.filter((employee) =>
                normalizeName(employee.name).includes(normalizedName),
            );
        }

        const query = new URLSearchParams({
            id: search.value,
        });

        const employee = await apiRequest<EmployeeResponse>(
            `/employees/id?${query.toString()}`,
            {signal},
        );

        return [employee];
    },
    ...createResourceWriter<EmployeeResponse, EmployeeInput>('/employees'),
};
