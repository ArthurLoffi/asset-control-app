import type {TFunction} from 'i18next';
import type {
    EmployeeRecord,
    Machine,
    Monitor,
    Phone,
    Printer,
    OrganizationOption,
} from '@/entities';
import {ROUTES, i18n} from '@/shared';

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
        records: Array<Machine | Monitor | Phone>,
    ): InventoryLocation[] =>
        records.map((record) => {
            const employee =
                record.employee_id === null
                    ? undefined
                    : employees.get(record.employee_id);
            return location(employee?.branch_id, employee?.department_id);
        });
    const records: InventoryLocation[] = [
        ...assignedRecords(snapshot.machines),
        ...assignedRecords(snapshot.monitors),
        ...assignedRecords(snapshot.phones),
        ...snapshot.printers.map((printer) =>
            location(printer.branch_id, printer.departments_id),
        ),
    ];
    const statusCounts = new Map<string, number>();
    for (const record of [
        ...snapshot.machines,
        ...snapshot.monitors,
        ...snapshot.phones,
    ]) {
        const status =
            record.situation?.length > 0 ? record.situation : 'Not recorded';
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }

    const statusTotal =
        snapshot.machines.length +
        snapshot.monitors.length +
        snapshot.phones.length;
    return {
        metrics: [
            {
                label: 'Registered employees',
                value: snapshot.employees.length,
                href: ROUTES.EMPLOYEES,
            },
            {
                label: 'Machines',
                value: snapshot.machines.length,
                href: ROUTES.MACHINES,
            },
            {
                label: 'Monitor records',
                value: snapshot.monitors.length,
                href: ROUTES.MONITORS,
            },
            {
                label: 'Phone records',
                value: snapshot.phones.length,
                href: ROUTES.PHONES,
            },
            {
                label: 'Printers',
                value: snapshot.printers.length,
                href: ROUTES.PRINTERS,
            },
        ],
        total: records.length,
        statusTotal,
        statuses: [...statusCounts].map(([name, value]) => ({
            name,
            value,
            percentage: (value / statusTotal) * 100,
        })),
        departments: groupRecords(records, 'department'),
        branches: groupRecords(records, 'branch'),
    };
}

export type DashboardSummary = ReturnType<typeof summarizeDashboard>;
