import {useRef, useState} from 'react';
import {sessionApi, useSession} from '@/entities';

export function useLogout(): {
    submitting: boolean;
    error: string | undefined;
    logout: () => Promise<void>;
} {
    const {clearSession} = useSession();
    const busy = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>();
    return {
        submitting,
        error,
        async logout() {
            if (busy.current) {
                return;
            }

            busy.current = true;
            setSubmitting(true);
            setError(undefined);
            try {
                await sessionApi.logout();
                clearSession();
            } catch (error_) {
                setError(
                    error_ instanceof Error
                        ? error_.message
                        : 'Unable to sign out.',
                );
            } finally {
                busy.current = false;
                setSubmitting(false);
            }
        },
    };
}
