import {describe, expect, it} from 'vitest';
import {parsePhoneForm, type PhoneFormValues} from './phone-form.js';

const validValues: PhoneFormValues = {
    equipament: 'Celular',
    model: 'Galaxy A55',
    imei: '012345678901234',
    serial_number: 'SN-100',
    has_chip: 'false',
    situation: 'Em uso',
    employee_id: '7',
};

describe('parsePhoneForm', () => {
    it('preserves IMEI leading zeros and maps assignment and SIM status', () => {
        expect(parsePhoneForm(validValues)).toEqual({
            input: {
                equipament: 'Celular',
                model: 'Galaxy A55',
                imei: '012345678901234',
                serial_number: 'SN-100',
                has_chip: false,
                situation: 'Em uso',
                employee_id: 7,
            },
        });
    });

    it('allows an unassigned phone and unspecified optional details', () => {
        expect(
            parsePhoneForm({
                ...validValues,
                equipament: '',
                employee_id: '',
                has_chip: '',
            }).input,
        ).toMatchObject({equipament: null, employee_id: null, has_chip: null});
    });

    it.each(['model', 'imei', 'serial_number', 'situation'] as const)(
        'requires %s',
        (field) => {
            expect(
                parsePhoneForm({...validValues, [field]: ''}).error,
            ).toBeDefined();
        },
    );

    it.each(['0', '-1', '1.5', 'invalid', '9007199254740992'])(
        'rejects invalid employee ID %s',
        (employee_id) => {
            expect(
                parsePhoneForm({...validValues, employee_id}).error,
            ).toBeDefined();
        },
    );

    it('rejects invalid situation and SIM status values', () => {
        expect(
            parsePhoneForm({...validValues, situation: 'Discarded'}).error,
        ).toBeDefined();
        expect(
            parsePhoneForm({...validValues, has_chip: 'yes'}).error,
        ).toBeDefined();
    });

    it('accepts the supported SIM-only and no-SIM assignments', () => {
        expect(
            parsePhoneForm({
                ...validValues,
                equipament: 'Só chip',
                has_chip: 'true',
            }).input,
        ).toMatchObject({equipament: 'Só chip', has_chip: true});
        expect(
            parsePhoneForm({
                ...validValues,
                equipament: 'Sem chip',
                has_chip: 'false',
            }).input,
        ).toMatchObject({equipament: 'Sem chip', has_chip: false});
    });

    it('rejects unsupported equipment and contradictory SIM details', () => {
        expect(
            parsePhoneForm({...validValues, equipament: 'Unknown device'})
                .error,
        ).toBeDefined();
        expect(
            parsePhoneForm({
                ...validValues,
                equipament: 'Só chip',
                has_chip: 'false',
            }).error,
        ).toBeDefined();
        expect(
            parsePhoneForm({
                ...validValues,
                equipament: 'Sem chip',
                has_chip: 'true',
            }).error,
        ).toBeDefined();
    });
});
