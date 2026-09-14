import type {ResourceRecord, CollectionSearch} from '@/shared';

export type Employee = ResourceRecord & {
    name: string;
    phone: string;
    email: string;
    branch_id: number;
    branch_name: string;
    department_id: number;
    department_name: string;
};

export type EmployeeInput = Pick<
    Employee,
    'name' | 'phone' | 'email' | 'branch_id' | 'department_id'
>;

export type EmployeeRecord = Omit<Employee, 'branch_name' | 'department_name'>;

export type EmployeeSearch = CollectionSearch<'id' | 'name'>;
