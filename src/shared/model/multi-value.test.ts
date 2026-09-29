import {describe, expect, it} from 'vitest';
import {effectiveValues, parseEmployeeIds, splitValues} from './multi-value';

describe('multiple values', () => {
    it('accepts distinct employee IDs and rejects invalid or duplicate IDs', () => {
        expect(parseEmployeeIds('3\n4, 5')).toEqual([3, 4, 5]);
        expect(parseEmployeeIds('3\n3')).toBeUndefined();
        expect(parseEmployeeIds('3\n-1')).toBeUndefined();
    });

    it('preserves legacy singular values when arrays are absent', () => {
        expect(effectiveValues(3)).toEqual([3]);
        expect(effectiveValues(3, [])).toEqual([]);
        expect(splitValues('a@example.com\nb@example.com')).toEqual([
            'a@example.com',
            'b@example.com',
        ]);
    });
});
