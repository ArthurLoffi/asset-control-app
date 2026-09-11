export type Employee = {
    id: number;
    name: string;
    phone: string;
    email: string;
    branch_id: number;
    branch_name: string;
    department_id: number;
    department_name: string;
    created_at: string;
};

export type EmployeeInput = Pick<
    Employee,
    'name' | 'phone' | 'email' | 'branch_id' | 'department_id'
>;

export type EmployeeSearch =
    {kind: 'all'} | {kind: 'name' | 'id'; value: string};
