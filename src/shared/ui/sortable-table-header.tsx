import {Group, Table, UnstyledButton} from '@mantine/core';
import {
    IconChevronDown,
    IconChevronUp,
    IconSelector,
} from '@tabler/icons-react';
import type {ReactElement, ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import type {TableSort} from '../model/table-sort';

type SortableTableHeaderProps<Key extends string> = {
    column: Key;
    label: ReactNode;
    sort: TableSort<Key> | undefined;
    onSort: (column: Key) => void;
};

export function SortableTableHeader<Key extends string>({
    column,
    label,
    sort,
    onSort,
}: SortableTableHeaderProps<Key>): ReactElement {
    const {t} = useTranslation();
    const isActive = sort?.key === column;
    const direction = isActive ? sort.direction : undefined;
    const nextDirection = direction === 'asc' ? 'desc' : 'asc';
    const ariaSort =
        direction === 'asc'
            ? 'ascending'
            : direction === 'desc'
              ? 'descending'
              : 'none';
    const sortLabel = t(
        nextDirection === 'asc'
            ? 'common.sort.ascending'
            : 'common.sort.descending',
        {column: label},
    );

    return (
        <Table.Th scope="col" aria-sort={ariaSort}>
            <UnstyledButton
                aria-label={sortLabel}
                title={sortLabel}
                onClick={() => {
                    onSort(column);
                }}
                style={{width: '100%'}}
            >
                <Group gap={4} wrap="nowrap">
                    <span>{label}</span>
                    {direction === 'asc' ? (
                        <IconChevronUp size={14} aria-hidden />
                    ) : direction === 'desc' ? (
                        <IconChevronDown size={14} aria-hidden />
                    ) : (
                        <IconSelector size={14} opacity={0.45} aria-hidden />
                    )}
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}
