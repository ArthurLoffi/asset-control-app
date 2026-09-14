import type {EmailInput} from '@/entities';
import {formText, type FormResult} from '@/shared';

export function parseEmailForm(data: FormData): FormResult<EmailInput> {
    const user = formText(data, 'user').trim();
    if (user.length === 0) {
        return {error: 'Enter a user.'};
    }

    const email = formText(data, 'email').trim();
    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/u.test(email)) {
        return {error: 'Enter a valid email address.'};
    }

    const password = formText(data, 'password_hash');
    if (password.length === 0) {
        return {error: 'Enter a password.'};
    }

    return {input: {user, email, password_hash: password}};
}
