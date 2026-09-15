import {useRef, useState, type SubmitEvent} from 'react';
import {sessionApi, useSession} from '@/entities';
import {formText} from '@/shared';

export function useLogin(): {
    submitting: boolean;
    error: string | undefined;
    submit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
} {
    const {acceptSession} = useSession();
    const busy = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>();
    return {
        submitting,
        error,
        async submit(event) {
            event.preventDefault();
            if (busy.current) {
                return;
            }

            const data = new FormData(event.currentTarget);
            const user = formText(data, 'user').trim();
            const password = formText(data, 'password');
            if (user === '' || password === '') {
                setError('Enter your username and password.');
                return;
            }

            busy.current = true;
            setSubmitting(true);
            setError(undefined);
            try {
                acceptSession(await sessionApi.login({user, password}));
            } catch (error_) {
                setError(
                    error_ instanceof Error
                        ? error_.message
                        : 'Unable to sign in.',
                );
            } finally {
                busy.current = false;
                setSubmitting(false);
            }
        },
    };
}
