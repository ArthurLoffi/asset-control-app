import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
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
    const {t} = useTranslation();
    const records = useEmployees(search);
    const organizations = useOrganizations();
    const {branchNames, departmentNames} = organizations;
    const employees = useMemo(
        () =>
            records.employees.map((employee) => ({
                ...employee,
                branch_name:
                    branchNames.get(employee.branch_id) ??
                    t('common.labels.branchId', {id: employee.branch_id}),
                department_name:
                    departmentNames.get(employee.department_id) ??
                    t('common.labels.departmentId', {
                        id: employee.department_id,
                    }),
            })),
        [records.employees, branchNames, departmentNames, t],
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
