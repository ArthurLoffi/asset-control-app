import {Anchor, Table, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import type {InventoryRecord} from '../model/dashboard';
import {ChartPanel, StatusBadge} from './dashboard-components';
import {formatRecordDate} from '@/shared';

export function InventoryTable({
    records,
}: {
    records: InventoryRecord[];
}): ReactElement {
    const {t} = useTranslation();
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
                                {[
                                    t('record'),
                                    t('common.fields.employee'),
                                    t('common.fields.department'),
                                    t('common.fields.branch'),
                                    t('status'),
                                    t('created'),
                                ].map((label) => (
                                    <Table.Th key={label} scope="col">
                                        {label}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {records.map((record) => (
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
