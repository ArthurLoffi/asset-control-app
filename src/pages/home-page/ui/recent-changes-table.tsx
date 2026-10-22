import {Anchor, Avatar, Group, Stack, Table, Text} from '@mantine/core';
import {
    IconDeviceDesktop,
    IconDeviceLaptop,
    IconDeviceMobile,
    IconMail,
    IconPrinter,
    IconUser,
    type Icon,
} from '@tabler/icons-react';
import {useCallback, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {RecentChange} from '../model/dashboard';
import {ChartPanel} from './dashboard-components';
import {
    i18n,
    ROUTES,
    SortableTableHeader,
    sortableTimestamp,
    translateInventoryValue,
    useTableSort,
} from '@/shared';

type ChangeSortKey = 'resource' | 'record' | 'change' | 'user' | 'time';

const resourceLinks: Record<string, string> = {
    employees: ROUTES.EMPLOYEES,
    machines: ROUTES.MACHINES,
    monitors: ROUTES.MONITORS,
    phones: ROUTES.PHONES,
    printers: ROUTES.PRINTERS,
    emails: ROUTES.EMAILS,
};

const resourceLabels: Record<string, string> = {
    employees: 'employee',
    machines: 'machine',
    monitors: 'monitor',
    phones: 'phone',
    printers: 'printer',
    emails: 'email',
};

const resourceIcons: Record<string, Icon> = {
    employees: IconUser,
    machines: IconDeviceLaptop,
    monitors: IconDeviceDesktop,
    phones: IconDeviceMobile,
    printers: IconPrinter,
    emails: IconMail,
};

const fieldLabels: Record<string, string> = {
    name: 'common.fields.fullName',
    phone: 'common.fields.contactPhone',
    email: 'common.fields.email',
    branch_id: 'common.fields.branch',
    department_id: 'common.fields.department',
    departments_id: 'common.fields.department',
    user: 'common.fields.user',
    asset_number: 'common.fields.assetNumber',
    type: 'type',
    model: 'common.fields.model',
    serial_number: 'common.fields.serialNumber',
    has_keyboard: 'keyboardIncluded',
    has_mouse: 'mouseIncluded',
    machine_condition: 'common.fields.condition',
    monitor_condition: 'common.fields.condition',
    situation: 'common.fields.situation',
    employee_id: 'common.fields.employee',
    has_monitor: 'monitorProvided',
    brand: 'common.fields.brand',
    equipament: 'companyEquipment',
    imei: 'common.fields.imei',
    has_chip: 'simIncluded',
    ip: 'common.fields.ipAddress',
};

function formatChangeTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900
        ? '—'
        : new Intl.DateTimeFormat(i18n.language, {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(date);
}

function ResourceCell({resource}: {resource: string}): ReactElement {
    const {t} = useTranslation();
    const link = resourceLinks[resource];
    if (link === undefined) {
        return <Text size="sm">{resource}</Text>;
    }

    const ResourceIcon = resourceIcons[resource];

    return (
        <Anchor component={Link} to={link} size="sm">
            <Group gap={6} wrap="nowrap" component="span">
                <ResourceIcon size={16} stroke={1.6} aria-hidden />
                {t(resourceLabels[resource])}
            </Group>
        </Anchor>
    );
}

function EditorCell({change}: {change: RecentChange}): ReactElement {
    const {t} = useTranslation();
    if (change.user_name.length === 0) {
        return (
            <Text size="sm" c="dimmed">
                {t('dashboard.unknownEditor', {id: change.user_id})}
            </Text>
        );
    }

    return (
        <Group gap="xs" wrap="nowrap">
            <Avatar
                name={change.user_name}
                color="initials"
                size={28}
                aria-hidden
            />
            <Text size="sm">{change.user_name}</Text>
        </Group>
    );
}

export function RecentChangesTable({
    changes,
}: {
    changes: RecentChange[];
}): ReactElement {
    const {t} = useTranslation();
    const formatValue = (field: string, value: string): string => {
        if (value.length === 0) {
            return t(
                field === 'employee_id'
                    ? 'common.labels.unassigned'
                    : 'common.labels.notRecorded',
            );
        }

        if (field === 'employee_id') {
            return t('common.labels.employeeId', {id: value});
        }

        if (value === 'true' || value === 'false') {
            return t(
                value === 'true' ? 'common.values.yes' : 'common.values.no',
            );
        }

        return translateInventoryValue(value, t) ?? value;
    };

    const getSortValue = useCallback(
        (change: RecentChange, key: ChangeSortKey) => {
            switch (key) {
                case 'resource': {
                    return change.resource;
                }

                case 'record': {
                    return change.resource_id;
                }

                case 'change': {
                    return change.changed_fields
                        .map(({field}) => field)
                        .join(', ');
                }

                case 'user': {
                    return change.user_name.length > 0
                        ? change.user_name
                        : change.user_id;
                }

                case 'time': {
                    return sortableTimestamp(change.time);
                }
            }
        },
        [],
    );
    const {sort, sortedRecords, toggleSort} = useTableSort(
        changes,
        getSortValue,
        i18n.language,
    );
    return (
        <ChartPanel
            title={t('dashboard.latestChanges')}
            description={t('dashboard.latestChangesDescription')}
        >
            {changes.length === 0 ? (
                <Text c="dimmed" size="sm">
                    {t('dashboard.noChanges')}
                </Text>
            ) : (
                <Table.ScrollContainer minWidth={900}>
                    <Table
                        verticalSpacing="md"
                        highlightOnHover
                        aria-label={t('dashboard.latestChanges')}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                {(
                                    [
                                        [
                                            'resource',
                                            t('dashboard.changedResource'),
                                        ],
                                        ['record', t('dashboard.recordId')],
                                        [
                                            'change',
                                            t('dashboard.changeDetails'),
                                        ],
                                        ['user', t('dashboard.changedBy')],
                                        ['time', t('dashboard.changedAt')],
                                    ] as Array<[ChangeSortKey, string]>
                                ).map(([column, label]) => (
                                    <SortableTableHeader
                                        key={column}
                                        column={column}
                                        label={label}
                                        sort={sort}
                                        onSort={toggleSort}
                                    />
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {sortedRecords.map((change) => (
                                <Table.Tr key={change.id}>
                                    <Table.Td>
                                        <ResourceCell
                                            resource={change.resource}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" ff="monospace">
                                            {change.resource_id}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        {change.changed_fields.length === 0 ? (
                                            <Text size="sm" c="dimmed">
                                                {t('dashboard.noFieldDetails')}
                                            </Text>
                                        ) : (
                                            <Stack gap={2}>
                                                {change.changed_fields.map(
                                                    ({
                                                        field,
                                                        before,
                                                        after,
                                                    }) => (
                                                        <Text
                                                            key={field}
                                                            size="sm"
                                                        >
                                                            <Text
                                                                component="span"
                                                                fw={500}
                                                            >
                                                                {t(
                                                                    fieldLabels[
                                                                        field
                                                                    ] ?? field,
                                                                )}
                                                                :
                                                            </Text>{' '}
                                                            {t(
                                                                'dashboard.changeValue',
                                                                {
                                                                    before: formatValue(
                                                                        field,
                                                                        before,
                                                                    ),
                                                                    after: formatValue(
                                                                        field,
                                                                        after,
                                                                    ),
                                                                },
                                                            )}
                                                        </Text>
                                                    ),
                                                )}
                                            </Stack>
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <EditorCell change={change} />
                                    </Table.Td>
                                    <Table.Td style={{whiteSpace: 'nowrap'}}>
                                        <Text size="sm">
                                            {formatChangeTime(change.time)}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )}
        </ChartPanel>
    );
}
