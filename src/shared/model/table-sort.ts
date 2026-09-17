import {useMemo, useState} from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortValue = boolean | number | string | undefined;
export type TableSort<Key extends string> = {
    key: Key;
    direction: SortDirection;
};

function isMissing(value: SortValue): boolean {
    return (
        value === undefined || (typeof value === 'string' && value.length === 0)
    );
}

export function sortableTimestamp(value: string): number {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareValues(
    left: SortValue,
    right: SortValue,
    locale: string,
): number {
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
        return Number(left) - Number(right);
    }

    return String(left).localeCompare(String(right), locale, {
        numeric: true,
        sensitivity: 'base',
    });
}

export function sortTableRecords<T, Key extends string>(
    records: readonly T[],
    sort: TableSort<Key> | undefined,
    getValue: (record: T, key: Key) => SortValue,
    locale: string,
): T[] {
    if (sort === undefined) {
        return [...records];
    }

    return records.toSorted((left, right) => {
        const leftValue = getValue(left, sort.key);
        const rightValue = getValue(right, sort.key);
        if (isMissing(leftValue) || isMissing(rightValue)) {
            if (isMissing(leftValue) === isMissing(rightValue)) {
                return 0;
            }

            return isMissing(leftValue) ? 1 : -1;
        }

        const result = compareValues(leftValue, rightValue, locale);
        return sort.direction === 'asc' ? result : -result;
    });
}

export function useTableSort<T, Key extends string>(
    records: readonly T[],
    getValue: (record: T, key: Key) => SortValue,
    locale: string,
) {
    const [sort, setSort] = useState<TableSort<Key>>();
    const sortedRecords = useMemo(
        () => sortTableRecords(records, sort, getValue, locale),
        [getValue, locale, records, sort],
    );

    function toggleSort(key: Key): void {
        setSort((current) => ({
            key,
            direction:
                current?.key === key && current.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
    }

    return {sort, sortedRecords, toggleSort};
}
