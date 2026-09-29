import {type Employee, type Phone} from '@/entities';
import {effectiveValues} from '@/shared';

export const provisionOptions = [
    {
        value: 'phone_and_sim',
        label: 'Phone + SIM',
        color: 'teal',
        description: 'Company mobile phone and SIM card',
    },
    {
        value: 'sim_only',
        label: 'SIM only',
        color: 'blue',
        description: 'Company SIM card without a company phone',
    },
    {
        value: 'no_sim',
        label: 'No SIM',
        color: 'gray',
        description: 'Recorded as having no company SIM card',
    },
    {
        value: 'unknown',
        label: 'Not recorded',
        color: 'yellow',
        description: 'Missing or incomplete assignment information',
    },
] as const;

export type Provision = (typeof provisionOptions)[number]['value'];
export type EmployeePhoneSummary = {
    employee: Employee;
    phones: Phone[];
    provision: Provision;
};

function getProvision(phones: Phone[]): Provision {
    if (phones.length === 0) {
        return 'unknown';
    }

    const hasPhone = phones.some(({equipament}) => equipament === 'Celular');
    const hasSim = phones.some(
        ({equipament, has_chip}) =>
            equipament !== 'Sem chip' &&
            (has_chip === true ||
                (equipament === 'Só chip' && has_chip !== false)),
    );
    if (hasPhone && hasSim) {
        return 'phone_and_sim';
    }

    if (
        hasSim &&
        phones.every(
            ({equipament}) =>
                equipament === 'Só chip' || equipament === 'Sem chip',
        )
    ) {
        return 'sim_only';
    }

    if (
        phones.every(
            ({equipament, has_chip}) =>
                (has_chip === false && equipament !== 'Só chip') ||
                (equipament === 'Sem chip' && has_chip !== true),
        )
    ) {
        return 'no_sim';
    }

    return 'unknown';
}

export function summarizeEmployeePhones(
    employees: Employee[],
    phones: Phone[],
): EmployeePhoneSummary[] {
    const assignments = new Map<number, Phone[]>();
    for (const phone of phones) {
        for (const id of effectiveValues(
            phone.employee_id,
            phone.employee_ids,
        )) {
            const assigned = assignments.get(id) ?? [];
            assigned.push(phone);
            assignments.set(id, assigned);
        }
    }

    return employees.map((employee) => {
        const assigned = assignments.get(employee.id) ?? [];
        return {employee, phones: assigned, provision: getProvision(assigned)};
    });
}

export function matchesEmployeeName(name: string, query: string) {
    const normalize = (value: string) =>
        value
            .trim()
            .normalize('NFD')
            .replaceAll(/\p{Mark}/gu, '')
            .toLocaleLowerCase();
    return normalize(name).includes(normalize(query));
}
