import {describe, expect, it} from 'vitest';
import {validateEmailSearch} from './email-search';

describe('email search', () => {
    it.each([
        '',
        ' ',
        '0',
        '-1',
        '1.5',
        '1e2',
        '2147483648',
        '9007199254740992',
    ])('rejects invalid int32 ID %j', (value) => {
        expect(validateEmailSearch('id', value)).not.toBe('');
    });

    it.each(['1', '2147483647', ' 42 '])(
        'accepts positive int32 ID %j',
        (value) => {
            expect(validateEmailSearch('id', value)).toBe('');
        },
    );

    it('requires a user and allows literal special characters', () => {
        expect(validateEmailSearch('user', ' ')).not.toBe('');
        expect(validateEmailSearch('user', 'Ana [Ops]&')).toBe('');
    });
});
