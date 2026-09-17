import {Badge, Button, Table, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {translateInventoryValue, formatRecordDate} from '@/shared';
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
    const {t} = useTranslation();
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
            <Table.Td>
                {branchName ??
                    `${t('common.fields.branch')} #${printer.branch_id}`}
            </Table.Td>
            <Table.Td>
                {departmentName ??
                    `${t('common.fields.department')} #${printer.departments_id}`}
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray">
                    {translateInventoryValue(printer.machine_condition, t) ??
                        t('common.labels.notSpecified')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {formatRecordDate(printer.created_at)}
                </Text>
            </Table.Td>
            <Table.Td>
                <Button
                    variant="subtle"
                    size="xs"
                    aria-label={t('editRecordWithId', {
                        record: printer.model,
                        id: printer.id,
                    })}
                    onClick={() => {
                        onEdit(printer);
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            </Table.Td>
        </Table.Tr>
    );
}
