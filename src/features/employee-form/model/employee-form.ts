import type {EmployeeInput} from '@/entities';
import {splitValues} from '@/shared';

export type EmployeeFormValues = Record<
    'name' | 'emails' | 'phones' | 'branch_id' | 'department_id',
    string
>;

type EmployeeFormResult =
    {input: EmployeeInput; error?: never} | {input?: never; error: string};

function isInvalidEmail(email: string): boolean {
    const at = email.indexOf('@');
    const dot = email.lastIndexOf('.');
    return (
        email.length > 255 ||
        at < 1 ||
        email.slice(at + 1).includes('@') ||
        dot <= at + 1 ||
        dot === email.length - 1 ||
        /\s/u.test(email)
    );
}

export function parseEmployeeForm(
    values: EmployeeFormValues,
): EmployeeFormResult {
    const name = values.name.trim();
    const emails = splitValues(values.emails);
    const phones = splitValues(values.phones);
    const branchId = Number(values.branch_id);
    const departmentId = Number(values.department_id);
    if (
        name.length === 0 ||
        emails.length === 0 ||
        [branchId, departmentId].some(
            (id) => !(Number.isSafeInteger(id) && id > 0),
        )
    ) {
        return {
            error: 'Enter a name and email, then select a branch and department.',
        };
    }

    if (
        emails.some((email) => isInvalidEmail(email)) ||
        phones.some((phone) => phone.length > 20) ||
        new Set(emails.map((email) => email.toLowerCase())).size !==
            emails.length ||
        new Set(phones.map((phone) => phone.toLowerCase())).size !==
            phones.length
    ) {
        return {
            error: 'Enter distinct, valid email addresses and phone numbers.',
        };
    }

    return {
        input: {
            name,
            email: emails[0] ?? '',
            emails,
            phone: phones[0] ?? '',
            phones,
            branch_id: branchId,
            department_id: departmentId,
        },
    };
}
