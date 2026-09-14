import {describe, expect, it} from 'vitest';
import {
    organizationOptions,
    parsePrinterForm,
    type PrinterFormValues,
} from './printer-form';

const valid: PrinterFormValues = {
    asset_number: '42',
    model: ' LaserJet ',
    ip: ' 192.168.1.100 ',
    machine_condition: '',
    branch_id: '1',
    departments_id: '2',
};

describe('printer form validation', () => {
    it('trims text, converts IDs, and clears optional condition with null', () => {
        expect(parsePrinterForm(valid)).toEqual({
            input: {
                asset_number: 42,
                model: 'LaserJet',
                ip: '192.168.1.100',
                machine_condition: null,
                branch_id: 1,
                departments_id: 2,
            },
        });
    });

    it.each(['Novo', 'Bom', 'Ruim'])(
        'accepts backend condition %s',
        (machine_condition) => {
            expect(
                parsePrinterForm({...valid, machine_condition}).input
                    ?.machine_condition,
            ).toBe(machine_condition);
        },
    );

    it('rejects unsupported conditions and blank or oversized models', () => {
        for (const values of [
            {machine_condition: 'Good'},
            {model: ' '.repeat(3)},
            {model: 'a'.repeat(101)},
        ]) {
            expect(parsePrinterForm({...valid, ...values}).error).toBeDefined();
        }
    });

    it.each(['asset_number', 'branch_id', 'departments_id'] as const)(
        'rejects missing, fractional, negative, and unsafe %s',
        (field) => {
            for (const value of [
                '',
                '0',
                '-1',
                '1.5',
                'abc',
                '9007199254740992',
            ]) {
                expect(
                    parsePrinterForm({...valid, [field]: value}).error,
                ).toBeDefined();
            }
        },
    );

    it.each([
        '0.0.0.0',
        '255.255.255.255',
        '::1',
        '2001:db8::1',
        '2001:db8:0:0:0:0:2:1',
        '::ffff:192.168.1.1',
    ])('accepts IP %s', (ip) => {
        expect(parsePrinterForm({...valid, ip}).input?.ip).toBe(ip);
    });

    it.each([
        '',
        '999.1.1.1',
        '127.1',
        '192.168.01.1',
        'printer.local',
        'http://192.168.1.1',
        '192.168.1.1:80',
        '2001:::1',
        '[::1]',
        'fe80::1%eth0',
        '::ffff:999.1.1.1',
    ])('rejects invalid IP %s', (ip) => {
        expect(parsePrinterForm({...valid, ip}).error).toBeDefined();
    });

    it('preserves an existing assignment when its lookup is unavailable', () => {
        expect(organizationOptions([{id: 1, name: 'Head office'}], 2)).toEqual([
            {value: '1', label: 'Head office'},
            {value: '2', label: 'ID #2 (unavailable)'},
        ]);
        expect(
            organizationOptions([{id: 1, name: 'Head office'}], 1),
        ).toHaveLength(1);
    });
});
