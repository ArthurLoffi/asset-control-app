import {Badge, Button, Table, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {formatPrinterDate} from '../model/use-printers-page';
import type {Printer} from '@/entities';

type PrinterRowProps = {
    printer: Printer;
    branchName?: string;
    departmentName?: string;
    onEdit: (printer: Printer) => void;
};

export function PrinterRow({
    printer,
    branchName,
    departmentName,
    onEdit,
}: PrinterRowProps): ReactElement {
    return (
        <Table.Tr>
            <Table.Td>
                <Text size="sm" fw={500}>
                    {printer.model}
                </Text>
                <Text size="xs" c="dimmed">
                    ID #{printer.id}
                </Text>
            </Table.Td>
            <Table.Td>#{printer.asset_number}</Table.Td>
            <Table.Td>
                <Text size="sm" ff="monospace">
                    {printer.ip}
                </Text>
            </Table.Td>
            <Table.Td>{branchName ?? `Branch #${printer.branch_id}`}</Table.Td>
            <Table.Td>
                {departmentName ?? `Department #${printer.departments_id}`}
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {printer.machine_condition ?? 'Not specified'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {formatPrinterDate(printer.created_at)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Button
                    variant="subtle"
                    size="xs"
                    aria-label={`Edit ${printer.model} (ID ${printer.id})`}
                    onClick={() => {
                        onEdit(printer);
                    }}
                >
                    Edit
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}
