import {describe, expect, it} from 'vitest';
import {summarizeDashboard, type DashboardSnapshot} from './dashboard';
import type {Machine, Monitor, Phone} from '@/entities';

// Isolated test inputs only; production has no fixtures or fallback records.
function emptySnapshot(): DashboardSnapshot {
    return {
        employees: [],
        machines: [],
        monitors: [],
        phones: [],
        printers: [],
        branches: [],
        departments: [],
    };
}

function machine(overrides: Partial<Machine> = {}): Machine {
    return {
        id: 1,
        user: '',
        asset_number: null,
        type: 'Notebook',
        model: '',
        serial_number: '',
        has_keyboard: null,
        has_mouse: null,
        machine_condition: null,
        situation: 'Em uso',
        employee_id: null,
        created_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('dashboard aggregation', () => {
    it('keeps a successful empty response empty, without example data or NaN percentages', () => {
        const summary = summarizeDashboard(emptySnapshot());
        expect(summary.metrics.map(({value}) => value)).toEqual([
            0, 0, 0, 0, 0,
        ]);
        expect(summary.total).toBe(0);
        expect(summary.statuses).toEqual([]);
        expect(summary.departments).toEqual([]);
    });

    it('counts records without reinterpreting SIM-only or no-monitor entries as physical devices', () => {
        const snapshot = emptySnapshot();
        const monitor: Monitor = {
            id: 1,
            has_monitor: false,
            asset_number: null,
            brand: null,
            model: '',
            serial_number: null,
            monitor_condition: null,
            situation: 'Sem uso',
            employee_id: null,
            created_at: '',
        };
        const phone: Phone = {
            id: 1,
            equipament: 'Só chip',
            model: '',
            imei: '',
            serial_number: '',
            has_chip: true,
            situation: 'Em uso',
            employee_id: null,
            created_at: '',
        };
        snapshot.monitors = [monitor];
        snapshot.phones = [phone];
        snapshot.machines = [machine()];
        snapshot.printers = [
            {
                id: 1,
                model: '',
                asset_number: 1,
                ip: '127.0.0.1',
                machine_condition: null,
                branch_id: 20,
                departments_id: 30,
                created_at: '',
            },
        ];
        const summary = summarizeDashboard(snapshot);
        expect(summary.total).toBe(4);
        expect(summary.statusTotal).toBe(3);
        expect(summary.statuses).toEqual([
            {name: 'Em uso', value: 2, percentage: (2 / 3) * 100},
            {name: 'Sem uso', value: 1, percentage: (1 / 3) * 100},
        ]);
        expect(summary.branches).toContainEqual({
            key: '20',
            name: 'Branch #20',
            value: 1,
        });
        expect(summary.departments).toContainEqual({
            key: '30',
            name: 'Department #30',
            value: 1,
        });
    });

    it('joins locations by ID and preserves missing employee/location references', () => {
        const snapshot = emptySnapshot();
        snapshot.employees = [
            {
                id: 8,
                name: 'Recorded name',
                phone: '',
                email: '',
                branch_id: 2,
                department_id: 3,
                created_at: '',
            },
        ];
        snapshot.branches = [{id: 2, name: 'Recorded branch'}];
        snapshot.departments = [{id: 3, name: 'Recorded department'}];
        snapshot.machines = [
            machine({employee_id: 8}),
            machine({id: 2, employee_id: 99}),
            machine({id: 3}),
        ];
        const summary = summarizeDashboard(snapshot);
        expect(summary.branches).toContainEqual({
            key: '2',
            name: 'Recorded branch',
            value: 1,
        });
        expect(summary.branches).toContainEqual({
            key: 'unknown',
            name: 'Branch not recorded',
            value: 2,
        });
        expect(
            summary.departments.reduce(
                (total, group) => total + group.value,
                0,
            ),
        ).toBe(summary.total);
    });

    it('preserves unfamiliar statuses and identifies missing status instead of guessing availability', () => {
        const snapshot = emptySnapshot();
        snapshot.machines = [
            machine({situation: '' as Machine['situation']}),
            machine({
                id: 2,
                situation: 'Legacy status' as Machine['situation'],
            }),
        ];
        expect(summarizeDashboard(snapshot).statuses).toEqual([
            {name: 'Not recorded', value: 1, percentage: 50},
            {name: 'Legacy status', value: 1, percentage: 50},
        ]);
    });

    it('does not mutate source arrays during aggregation', () => {
        const snapshot = emptySnapshot();
        snapshot.machines = [machine({id: 2}), machine({id: 1})];
        const original = structuredClone(snapshot);
        summarizeDashboard(snapshot);
        expect(snapshot).toEqual(original);
    });
});
