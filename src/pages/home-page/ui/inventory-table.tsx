import {Anchor, Table, Text} from '@mantine/core';
import {useCallback, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {InventoryRecord} from '../model/dashboard';
import {ChartPanel, StatusBadge} from './dashboard-components';
import {
    formatRecordDate,
    i18n,
    SortableTableHeader,
    sortableTimestamp,
    useTableSort,
} from '@/shared';

type InventorySortKey =
    'record' | 'employee' | 'department' | 'branch' | 'status' | 'created';

export function InventoryTable({
    records,
}: {
    records: InventoryRecord[];
}): ReactElement {
    const {t} = useTranslation();
    const getSortValue = useCallback(
        (record: InventoryRecord, key: InventorySortKey) => {
            switch (key) {
                case 'record': {
                    return record.model.length > 0 ? record.model : record.type;
                }

                case 'employee': {
                    return record.employee;
                }

                case 'department': {
                    return record.department;
                }

                case 'branch': {
                    return record.branch;
                }

                case 'status': {
                    return record.situation;
                }

                case 'created': {
                    return sortableTimestamp(record.createdAt);
                }
            }
        },
        [],
    );
    const {sort, sortedRecords, toggleSort} = useTableSort(
        records,
        getSortValue,
        i18n.language,
    );
    return (
        <ChartPanel
            title={t('dashboard.latestRecords')}
            description={t('dashboard.latestRecordsDescription')}
        >
            {records.length === 0 ? (
                <Text c="dimmed" size="sm">
                    {t('dashboard.noInventory')}
                </Text>
            ) : (
                <Table.ScrollContainer minWidth={900}>
                    <Table
                        verticalSpacing="md"
                        highlightOnHover
                        aria-label={t('dashboard.latestRecords')}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                {(
                                    [
                                        ['record', t('record')],
                                        [
                                            'employee',
                                            t('common.fields.employee'),
                                        ],
                                        [
                                            'department',
                                            t('common.fields.department'),
                                        ],
                                        ['branch', t('common.fields.branch')],
                                        ['status', t('status')],
                                        ['created', t('created')],
                                    ] as Array<[InventorySortKey, string]>
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
                            {sortedRecords.map((record) => (
                                <Table.Tr key={record.key}>
                                    <Table.Td>
                                        <Anchor
                                            component={Link}
                                            to={record.href}
                                            size="sm"
                                        >
                                            {record.model.length > 0
                                                ? record.model
                                                : t('modelNotRecorded')}
                                        </Anchor>
                                        <Text size="xs" c="dimmed">
                                            {t(
                                                {
                                                    Machine: 'machine',
                                                    'Monitor record':
                                                        'dashboard.monitorRecord',
                                                    'Phone record':
                                                        'dashboard.phoneRecord',
                                                    Printer: 'printer',
                                                }[record.type] ?? record.type,
                                            )}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{record.employee}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">
                                            {record.department}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{record.branch}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <StatusBadge
                                            status={record.situation}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {formatRecordDate(record.createdAt)}
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
