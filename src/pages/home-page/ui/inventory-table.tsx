import {Anchor, Table, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {Link} from 'react-router-dom';
import type {InventoryRecord} from '../model/dashboard';
import {ChartPanel, StatusBadge} from './dashboard-components';
import {formatRecordDate} from '@/shared';

export function InventoryTable({
    records,
}: {
    records: InventoryRecord[];
}): ReactElement {
    return (
        <ChartPanel
            title="Latest inventory records"
            description="Up to 10 records sorted by creation date."
        >
            {records.length === 0 ? (
                <Text c="dimmed" size="sm">
                    No inventory records.
                </Text>
            ) : (
                <Table.ScrollContainer minWidth={900}>
                    <Table
                        verticalSpacing="md"
                        highlightOnHover
                        aria-label="Latest inventory records"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                {[
                                    'Record',
                                    'Employee',
                                    'Department',
                                    'Branch',
                                    'Status',
                                    'Created',
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
                                                : 'Model not recorded'}
                                        </Anchor>
                                        <Text size="xs" c="dimmed">
                                            {record.type}
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
