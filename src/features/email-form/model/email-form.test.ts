import {describe, expect, it} from 'vitest';
import {parseEmailForm} from './email-form';

function values(overrides: Record<string, string> = {}) {
    const data = new FormData();
    for (const [key, value] of Object.entries({
        user: ' Ana ',
        email: ' ana@example.com ',
        password_hash: ' plain<&>text ',
        ...overrides,
    })) {
        data.set(key, value);
    }

    return data;
}

describe('email form', () => {
    it('normalizes user and email while preserving the password exactly', () => {
        expect(parseEmailForm(values())).toEqual({
            input: {
                user: 'Ana',
                email: 'ana@example.com',
                password_hash: ' plain<&>text ',
            },
        });
    });

    it.each<Record<string, string>>([
        {user: ' '},
        {email: 'invalid'},
        {email: ''},
        {password_hash: ''},
    ])('rejects invalid required values: %j', (input) => {
        expect(parseEmailForm(values(input)).error).toBeTruthy();
    });

    it('never copies server-owned fields into the payload', () => {
        const result = parseEmailForm(
            values({id: '999', created_at: '2000-01-01T00:00:00Z'}),
        );
        expect(result.input).not.toHaveProperty('id');
        expect(result.input).not.toHaveProperty('created_at');
    });
});
