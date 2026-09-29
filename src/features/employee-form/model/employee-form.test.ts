import {describe, expect, it} from 'vitest';
import {parseEmployeeForm, type EmployeeFormValues} from './employee-form';

const values: EmployeeFormValues = {
    name: 'Ana',
    emails: 'ana@example.com\nana.work@example.com',
    phones: '111\n222',
    branch_id: '1',
    department_id: '2',
};

describe('employee contact form', () => {
    it('sends full contact arrays and their first values', () => {
        expect(parseEmployeeForm(values).input).toEqual({
            name: 'Ana',
            email: 'ana@example.com',
            emails: ['ana@example.com', 'ana.work@example.com'],
            phone: '111',
            phones: ['111', '222'],
            branch_id: 1,
            department_id: 2,
        });
    });

    it('rejects invalid and duplicate contacts', () => {
        expect(
            parseEmployeeForm({...values, emails: 'invalid'}).error,
        ).toBeDefined();
        expect(
            parseEmployeeForm({
                ...values,
                emails: 'A@example.com\na@example.com',
            }).error,
        ).toBeDefined();
        expect(
            parseEmployeeForm({...values, phones: '111\n111'}).error,
        ).toBeDefined();
    });

    it('requires an email and valid organization IDs', () => {
        expect(parseEmployeeForm({...values, emails: ''}).error).toBeDefined();
        expect(
            parseEmployeeForm({...values, branch_id: '1.5'}).error,
        ).toBeDefined();
    });
});
