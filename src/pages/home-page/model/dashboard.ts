import type {TFunction} from 'i18next';
import type {
    EmployeeRecord,
    Machine,
    Monitor,
    Phone,
    Printer,
    OrganizationOption,
} from '@/entities';
import {ROUTES, effectiveValues, i18n} from '@/shared';

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
    changed_fields: Array<{field: string; before: string; after: string}>;
};

export type Distribution = {key: string; name: string; value: number};

export type DashboardMetricKey =
    'employees' | 'machines' | 'monitors' | 'phones' | 'printers';

// `detail` is a secondary count: equipped employees, unassigned equipment,
// or the number of branches that have printers.
export type DashboardMetric = {
    key: DashboardMetricKey;
    value: number;
    detail: number;
    href: string;
};

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
            current = {key, name: record[kind], value: 0};
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

    // Monitor and phone totals count physical devices only: a model, serial
    // number, or IMEI must be recorded. SIM-only and no-monitor entries are
    // kept out of every total, chart, and coverage figure.
    const {machines, printers} = snapshot;
    const monitors = snapshot.monitors.filter(
        (monitor) =>
            monitor.model.length > 0 ||
            (monitor.serial_number ?? '').length > 0,
    );
    const phones = snapshot.phones.filter(
        (phone) => phone.model.length > 0 || phone.imei.length > 0,
    );
    const equipment = [...machines, ...monitors, ...phones];
    const assignees = (record: Machine | Monitor | Phone): number[] =>
        effectiveValues(record.employee_id, record.employee_ids);
    const unassigned = (list: Array<Machine | Monitor | Phone>): number =>
        list.filter((record) => assignees(record).length === 0).length;
    const equippedEmployees = new Set(
        equipment.flatMap((record) =>
            assignees(record).filter((id) => employees.has(id)),
        ),
    );

    const location = (branchId?: number, departmentId?: number) => ({
        branchId,
        departmentId,
        branch:
            branchId === undefined
                ? t('common.labels.branchNotRecorded')
                : (branches.get(branchId) ??
                  t('common.labels.branchId', {id: branchId})),
        department:
            departmentId === undefined
                ? t('common.labels.departmentNotRecorded')
                : (departments.get(departmentId) ??
                  t('common.labels.departmentId', {id: departmentId})),
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

    const statusCounts = new Map<string, number>();
    for (const record of equipment) {
        const status =
            record.situation?.length > 0 ? record.situation : 'Not recorded';
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }

    const statusTotal = equipment.length;
    const metrics: DashboardMetric[] = [
        {
            key: 'employees',
            value: snapshot.employees.length,
            detail: equippedEmployees.size,
            href: ROUTES.EMPLOYEES,
        },
        {
            key: 'machines',
            value: machines.length,
            detail: unassigned(machines),
            href: ROUTES.MACHINES,
        },
        {
            key: 'monitors',
            value: monitors.length,
            detail: unassigned(monitors),
            href: ROUTES.MONITORS,
        },
        {
            key: 'phones',
            value: phones.length,
            detail: unassigned(phones),
            href: ROUTES.PHONES,
        },
        {
            key: 'printers',
            value: printers.length,
            detail: new Set(printers.map(({branch_id}) => branch_id)).size,
            href: ROUTES.PRINTERS,
        },
    ];

    return {
        metrics,
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
