import type { TFunction } from 'i18next';
import type {
    EmployeeRecord,
    Machine,
    Monitor,
    Phone,
    Printer,
    OrganizationOption,
} from '@/entities';
import { ROUTES, i18n } from '@/shared';

export type DashboardSnapshot = {
    employees: EmployeeRecord[];
    machines: Machine[];
    monitors: Monitor[];
    phones: Phone[];
    printers: Printer[];
    branches: OrganizationOption[];
    departments: OrganizationOption[];
};

export type InventoryLocation = {
    branch: string;
    department: string;
    branchId?: number;
    departmentId?: number;
};

export type RecentChange = {
    id: string;
    time: string;
    user_id: string;
    user_name: string;
    resource: string;
    resource_id: number;
    action: string;
    changed_fields: Array<{ field: string; before: string; after: string }>;
};

export type Distribution = { key: string; name: string; value: number };

function groupRecords(
    records: InventoryLocation[],
    kind: 'branch' | 'department',
): Distribution[] {
    const groups = new Map<string, Distribution>();
    const distribution: Distribution[] = [];
    for (const record of records) {
        const id = kind === 'branch' ? record.branchId : record.departmentId;
        const key = id === undefined ? 'unknown' : String(id);
        let current = groups.get(key);
        if (current === undefined) {
            current = { key, name: record[kind], value: 0 };
            groups.set(key, current);
            distribution.push(current);
        }

        current.value += 1;
    }

    return distribution.toSorted((a, b) => {
        const difference = b.value - a.value;
        return difference === 0 ? a.name.localeCompare(b.name) : difference;
    });
}

export function summarizeDashboard(
    snapshot: DashboardSnapshot,
    t: TFunction = i18n.getFixedT('en'),
) {
    const employees = new Map(
        snapshot.employees.map((employee) => [employee.id, employee]),
    );
    const branches = new Map(
        snapshot.branches.map((branch) => [branch.id, branch.name]),
    );
    const departments = new Map(
        snapshot.departments.map((department) => [
            department.id,
            department.name,
        ]),
    );

    // Só registros que representam um aparelho físico.
    // AJUSTE os predicados aos campos reais dos seus tipos.
    const hasPhoneDevice = (p: Phone) => Boolean(p.model || p.imei);
    const hasMonitorDevice = (m: Monitor) => Boolean(m.model || m.serial_number);

    const machines = snapshot.machines;
    const monitors = snapshot.monitors.filter(hasMonitorDevice);
    const phones = snapshot.phones.filter(hasPhoneDevice);
    const printers = snapshot.printers;

    console.table(
        snapshot.phones.map((p: Phone) => ({
            id: p.id,
            passa: hasPhoneDevice(p),
        })),
    );

    const location = (branchId?: number, departmentId?: number) => ({
        branchId,
        departmentId,
        branch:
            branchId === undefined
                ? t('common.labels.branchNotRecorded')
                : (branches.get(branchId) ??
                    t('common.labels.branchId', { id: branchId })),
        department:
            departmentId === undefined
                ? t('common.labels.departmentNotRecorded')
                : (departments.get(departmentId) ??
                    t('common.labels.departmentId', { id: departmentId })),
    });

    const assignedRecords = (
        list: Array<Machine | Monitor | Phone>,
    ): InventoryLocation[] =>
        list.map((record) => {
            const employee =
                record.employee_id === null
                    ? undefined
                    : employees.get(record.employee_id);
            return location(employee?.branch_id, employee?.department_id);
        });

    const records: InventoryLocation[] = [
        ...assignedRecords(machines),
        ...assignedRecords(monitors),
        ...assignedRecords(phones),
        ...printers.map((printer) =>
            location(printer.branch_id, printer.departments_id),
        ),
    ];

    const statusRecords = [...machines, ...monitors, ...phones];
    const statusCounts = new Map<string, number>();
    for (const record of statusRecords) {
        const status =
            record.situation?.length > 0 ? record.situation : 'Not recorded';
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }
    const statusTotal = statusRecords.length;

    return {
        metrics: [
            { label: 'Registered employees', value: snapshot.employees.length, href: ROUTES.EMPLOYEES },
            { label: 'Machines', value: machines.length, href: ROUTES.MACHINES },
            { label: 'Monitors', value: monitors.length, href: ROUTES.MONITORS },
            { label: 'Phones', value: phones.length, href: ROUTES.PHONES },
            { label: 'Printers', value: printers.length, href: ROUTES.PRINTERS },
        ],
        total: records.length,
        statusTotal,
        statuses: [...statusCounts].map(([name, value]) => ({
            name,
            value,
            percentage: statusTotal === 0 ? 0 : (value / statusTotal) * 100,
        })),
        departments: groupRecords(records, 'department'),
        branches: groupRecords(records, 'branch'),
    };
}

export type DashboardSummary = ReturnType<typeof summarizeDashboard>;
