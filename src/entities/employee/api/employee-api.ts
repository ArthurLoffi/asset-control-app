import type {Employee, EmployeeInput, EmployeeSearch} from '../model/types';
import {apiRequest, createResourceWriter} from '@/shared';

type EmployeeResponse = Omit<Employee, 'branch_name' | 'department_name'>;

type NameResponse = {
    name: string;
};

async function getName(
    resource: 'branch' | 'department',
    id: number,
    signal: AbortSignal,
) {
    const query = new URLSearchParams({id: String(id)});
    const response = await apiRequest<NameResponse>(
        `/utils/${resource}?${query.toString()}`,
        {signal},
    );
    return response.name;
}

async function addOrganizationNames(
    employees: EmployeeResponse[],
    signal: AbortSignal,
): Promise<Employee[]> {
    const branchIds = [...new Set(employees.map(({branch_id}) => branch_id))];
    const departmentIds = [
        ...new Set(employees.map(({department_id}) => department_id)),
    ];

    const [branches, departments] = await Promise.all([
        Promise.all(
            branchIds.map(
                async (id) =>
                    [id, await getName('branch', id, signal)] as const,
            ),
        ),
        Promise.all(
            departmentIds.map(
                async (id) =>
                    [id, await getName('department', id, signal)] as const,
            ),
        ),
    ]);
    const branchNames = new Map(branches);
    const departmentNames = new Map(departments);

    return employees.map((employee) => ({
        ...employee,
        branch_name: branchNames.get(employee.branch_id) ?? '',
        department_name: departmentNames.get(employee.department_id) ?? '',
    }));
}

function normalizeName(value: string) {
    return value
        .trim()
        .normalize('NFD')
        .replaceAll(/\p{Mark}/gu, '')
        .toLocaleLowerCase();
}

export const employeeApi = {
    async findIdsByName(name: string, signal: AbortSignal): Promise<number[]> {
        const employees =
            (await apiRequest<EmployeeResponse[] | undefined>('/employees', {
                signal,
            })) ?? [];
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
    ): Promise<Employee[]> {
        let employees: EmployeeResponse[];
        if (search.kind === 'all') {
            employees =
                (await apiRequest<EmployeeResponse[] | undefined>(
                    '/employees',
                    {
                        signal,
                    },
                )) ?? [];
        } else {
            const query = new URLSearchParams({[search.kind]: search.value});
            const employee = await apiRequest<EmployeeResponse>(
                `/employees/${search.kind}?${query.toString()}`,
                {signal},
            );
            employees = [employee];
        }

        return addOrganizationNames(employees, signal);
    },
    ...createResourceWriter<EmployeeResponse, EmployeeInput>('/employees'),
};
