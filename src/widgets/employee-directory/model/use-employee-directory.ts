import {useMemo} from 'react';
import {
    useEmployees,
    useOrganizations,
    type Employee,
    type EmployeeSearch,
} from '@/entities';

export function useEmployeeDirectory(search: EmployeeSearch): {
    employees: Employee[];
    loading: boolean;
    error: string;
    reload: () => void;
} {
    const records = useEmployees(search);
    const organizations = useOrganizations();
    const {branchNames, departmentNames} = organizations;
    const employees = useMemo(
        () =>
            records.employees.map((employee) => ({
                ...employee,
                branch_name:
                    branchNames.get(employee.branch_id) ??
                    `Branch #${employee.branch_id}`,
                department_name:
                    departmentNames.get(employee.department_id) ??
                    `Department #${employee.department_id}`,
            })),
        [records.employees, branchNames, departmentNames],
    );
    return {
        employees,
        loading: records.loading || organizations.loading,
        error: records.error.length > 0 ? records.error : organizations.error,
        reload(): void {
            records.reload();
            organizations.reload();
        },
    };
}
