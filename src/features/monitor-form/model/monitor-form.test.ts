import {describe, expect, it} from 'vitest';
import {parseMonitorForm, type MonitorFormValues} from './monitor-form.js';

const validValues: MonitorFormValues = {
    has_monitor: 'true',
    asset_number: '42',
    brand: 'Dell',
    model: 'P2422H',
    serial_number: 'SN-100',
    monitor_condition: 'Bom',
    situation: 'Em uso',
    employee_id: '7',
};

describe('parseMonitorForm', () => {
    it('normalizes form values into the API input', () => {
        expect(parseMonitorForm(validValues)).toEqual({
            input: {
                has_monitor: true,
                asset_number: 42,
                brand: 'Dell',
                model: 'P2422H',
                serial_number: 'SN-100',
                monitor_condition: 'Bom',
                situation: 'Em uso',
                employee_id: 7,
            },
        });
    });

    it('keeps optional fields null when they are empty', () => {
        const result = parseMonitorForm({
            ...validValues,
            has_monitor: '',
            asset_number: '',
            brand: '',
            serial_number: '',
            monitor_condition: '',
            employee_id: '',
        });

        expect(result.input).toMatchObject({
            has_monitor: null,
            asset_number: null,
            brand: null,
            serial_number: null,
            monitor_condition: null,
            employee_id: null,
        });
    });

    it('rejects invalid select values', () => {
        expect(
            parseMonitorForm({...validValues, situation: 'Discarded'}),
        ).toEqual({error: 'Select valid monitor details.'});
    });
});
