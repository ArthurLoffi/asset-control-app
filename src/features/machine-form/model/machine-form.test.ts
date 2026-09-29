import {describe, expect, it} from 'vitest';
import {parseMachineForm, type MachineFormValues} from './machine-form';

const validValues: MachineFormValues = {
    user: 'alex.morgan',
    asset_number: '42',
    type: 'Notebook',
    model: 'Latitude 5450',
    serial_number: 'SN-100',
    has_keyboard: 'true',
    has_mouse: 'false',
    machine_condition: 'Bom',
    situation: 'Em uso',
    employee_id: '7',
};

describe('parseMachineForm', () => {
    it('saves multiple employee IDs and rejects duplicates', () => {
        expect(
            parseMachineForm({...validValues, employee_ids: '7\n8'}).input,
        ).toMatchObject({
            employee_id: 7,
            employee_ids: [7, 8],
        });
        expect(
            parseMachineForm({...validValues, employee_ids: '7\n7'}).error,
        ).toBeDefined();
    });

    it('normalizes valid form values into the API input', () => {
        expect(parseMachineForm(validValues)).toEqual({
            input: {
                user: 'alex.morgan',
                asset_number: 42,
                type: 'Notebook',
                model: 'Latitude 5450',
                serial_number: 'SN-100',
                has_keyboard: true,
                has_mouse: false,
                machine_condition: 'Bom',
                situation: 'Em uso',
                employee_id: 7,
            },
        });
    });

    it('keeps optional fields null when they are empty', () => {
        const result = parseMachineForm({
            ...validValues,
            asset_number: '',
            employee_id: '',
            has_keyboard: '',
            has_mouse: '',
            machine_condition: '',
        });

        expect(result.input).toMatchObject({
            asset_number: null,
            employee_id: null,
            has_keyboard: null,
            has_mouse: null,
            machine_condition: null,
        });
    });

    it('rejects invalid numeric identifiers', () => {
        expect(parseMachineForm({...validValues, employee_id: '-2'})).toEqual({
            error: 'Asset and employee IDs must be positive whole numbers.',
        });
    });

    it('rejects invalid select values', () => {
        expect(
            parseMachineForm({...validValues, has_keyboard: 'sometimes'}),
        ).toEqual({error: 'Select valid machine details.'});
    });
});
