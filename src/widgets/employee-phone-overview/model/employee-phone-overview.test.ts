import {describe, expect, it} from 'vitest';
import {
    matchesEmployeeName,
    summarizeEmployeePhones,
} from './employee-phone-overview.js';
import type {Employee} from '@/entities/employee/index.js';
import type {Phone} from '@/entities/phone/index.js';

const employees: Employee[] = [1, 2, 3, 4].map((id) => ({
    id,
    name: `Employee ${id}`,
    phone: '',
    email: '',
    branch_id: 1,
    branch_name: 'Head office',
    department_id: 1,
    department_name: 'Operations',
    created_at: '2026-01-01',
}));
function phone(values: Partial<Phone>): Phone {
    return {
        id: 1,
        equipament: 'Celular',
        model: 'Galaxy A55',
        imei: '123',
        serial_number: 'SN1',
        has_chip: true,
        situation: 'Em uso',
        employee_id: 1,
        created_at: '2026-01-01',
        ...values,
    };
}

describe('employee phone coverage', () => {
    it('groups employees into phone + SIM, SIM only, no SIM, and not recorded', () => {
        const result = summarizeEmployeePhones(employees, [
            phone({}),
            phone({id: 2, employee_id: 2, equipament: 'Só chip'}),
            phone({
                id: 3,
                employee_id: 3,
                equipament: 'Sem chip',
                has_chip: false,
            }),
        ]);
        expect(result.map(({provision}) => provision)).toEqual([
            'phone_and_sim',
            'sim_only',
            'no_sim',
            'unknown',
        ]);
    });

    it('counts each employee once and combines separate phone and SIM assignments', () => {
        const result = summarizeEmployeePhones(employees, [
            phone({has_chip: false}),
            phone({id: 2, equipament: 'Só chip'}),
            phone({id: 3}),
            phone({id: 4, employee_id: null}),
            phone({id: 5, employee_id: 999}),
        ]);
        expect(result).toHaveLength(4);
        expect(result[0]?.provision).toBe('phone_and_sim');
        expect(result[0]?.phones).toHaveLength(3);
        expect(
            result.filter(({provision}) => provision === 'phone_and_sim'),
        ).toHaveLength(1);
    });

    it('does not turn unknown SIM details into no SIM', () => {
        const result = summarizeEmployeePhones(employees, [
            phone({has_chip: null}),
            phone({id: 2, employee_id: 2, equipament: null, has_chip: null}),
        ]);
        expect(result.every(({provision}) => provision === 'unknown')).toBe(
            true,
        );
    });

    it('uses explicit SIM-only and no-SIM categories when the SIM flag is missing', () => {
        const result = summarizeEmployeePhones(employees, [
            phone({equipament: 'Só chip', has_chip: null}),
            phone({
                id: 2,
                employee_id: 2,
                equipament: 'Sem chip',
                has_chip: null,
            }),
        ]);
        expect(result[0]?.provision).toBe('sim_only');
        expect(result[1]?.provision).toBe('no_sim');
    });

    it('shows a mobile phone without a SIM as no SIM', () => {
        expect(
            summarizeEmployeePhones(employees, [phone({has_chip: false})])[0]
                ?.provision,
        ).toBe('no_sim');
    });

    it('leaves contradictory or unsupported equipment records unclassified', () => {
        const result = summarizeEmployeePhones(employees, [
            phone({equipament: 'Só chip', has_chip: false}),
            phone({
                id: 2,
                employee_id: 2,
                equipament: 'Sem chip',
                has_chip: true,
            }),
            phone({
                id: 3,
                employee_id: 3,
                equipament: 'Legacy description',
                has_chip: true,
            }),
        ]);
        expect(result.every(({provision}) => provision === 'unknown')).toBe(
            true,
        );
    });

    it('matches partial employee names regardless of accents and case', () => {
        expect(matchesEmployeeName('João Silva', '  JOAO ')).toBe(true);
        expect(matchesEmployeeName('Anna Silva', 'sil')).toBe(true);
        expect(matchesEmployeeName('Anna Silva', 'Carlos')).toBe(false);
        expect(matchesEmployeeName('Anna Silva', ' '.repeat(3))).toBe(true);
    });
});
