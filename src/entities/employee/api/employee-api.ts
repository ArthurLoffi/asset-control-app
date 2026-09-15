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
        let employees: EmployeeResponse[];
        if (search.kind === 'all') {
            employees = await employeeApi.listRecords(signal);
        } else {
            const query = new URLSearchParams({[search.kind]: search.value});
            const employee = await apiRequest<EmployeeResponse>(
                `/employees/${search.kind}?${query.toString()}`,
                {signal},
            );
            employees = [employee];
        }

        return employees;
    },
    ...createResourceWriter<EmployeeResponse, EmployeeInput>('/employees'),
};
