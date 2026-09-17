import {describe, expect, it} from 'vitest';
import {sortTableRecords, type TableSort} from './table-sort';

type Record = {id: number; name?: string};
type Key = 'id' | 'name';

const records: Record[] = [
    {id: 10, name: 'Zulu'},
    {id: 2},
    {id: 1, name: 'alpha'},
];

function value(record: Record, key: Key): number | string | undefined {
    return record[key];
}

function sort(key: Key, direction: 'asc' | 'desc'): TableSort<Key> {
    return {key, direction};
}

describe('table sorting', () => {
    it('sorts numbers in ascending and descending order', () => {
        expect(
            sortTableRecords(records, sort('id', 'asc'), value, 'en').map(
                ({id}) => id,
            ),
        ).toEqual([1, 2, 10]);
        expect(
            sortTableRecords(records, sort('id', 'desc'), value, 'en').map(
                ({id}) => id,
            ),
        ).toEqual([10, 2, 1]);
    });

    it('sorts text alphabetically and keeps missing values last', () => {
        expect(
            sortTableRecords(records, sort('name', 'asc'), value, 'en').map(
                ({id}) => id,
            ),
        ).toEqual([1, 10, 2]);
        expect(
            sortTableRecords(records, sort('name', 'desc'), value, 'en').map(
                ({id}) => id,
            ),
        ).toEqual([10, 1, 2]);
    });

    it('does not mutate records when no sort is selected', () => {
        const result = sortTableRecords(records, undefined, value, 'en');
        expect(result).toEqual(records);
        expect(result).not.toBe(records);
    });
});
