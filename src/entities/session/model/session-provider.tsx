import {
    useCallback,
    useEffect,
    useState,
    type ReactElement,
    type ReactNode,
} from 'react';
import {sessionApi} from '../api/session-api';
import {SessionContext} from './session-context';
import type {Session} from './types';
import {ApiError, onUnauthorized} from '@/shared';

export function SessionProvider({
    children,
}: {
    children: ReactNode;
}): ReactElement {
    const [session, setSession] = useState<Session>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [expired, setExpired] = useState(false);
    const [signedOut, setSignedOut] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const clearSession = useCallback((): void => {
        setSignedOut(true);
        setSession(undefined);
        setExpired(false);
        setError(undefined);
    }, []);
    const acceptSession = useCallback((value: Session): void => {
        setSignedOut(false);
        setSession(value);
        setExpired(false);
        setError(undefined);
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(undefined);
        void sessionApi
            .current(controller.signal)
            .then((value) => {
                if (!controller.signal.aborted) {
                    setSession(value);
                }
            })
            .catch((error_: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (error_ instanceof ApiError && error_.status === 401) {
                    setSession(undefined);
                    setExpired(error_.code === 'AUTH_004');
                } else {
                    setError(
                        error_ instanceof Error
                            ? error_.message
                            : 'Unable to check your session.',
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });
        return () => {
            controller.abort();
        };
    }, [attempt]);
    useEffect(
        () =>
            onUnauthorized(() => {
                setSession(undefined);
                setExpired(true);
            }),
        [],
    );
    useEffect(() => {
        if (!session) {
            return;
        }

        const expire = (): void => {
            setSession(undefined);
            setExpired(true);
        };

        const expiresAt = session.expires_at * 1000;
        const timeout = setTimeout(expire, Math.max(0, expiresAt - Date.now()));
        const checkExpiry = (): void => {
            if (expiresAt <= Date.now()) {
                expire();
            }
        };

        window.addEventListener('focus', checkExpiry);
        document.addEventListener('visibilitychange', checkExpiry);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('focus', checkExpiry);
            document.removeEventListener('visibilitychange', checkExpiry);
        };
    }, [session]);
    return (
        <SessionContext.Provider
            value={{
                session,
                loading,
                error,
                expired,
                signedOut,
                acceptSession,
                clearSession,
                retry() {
                    setAttempt((value) => value + 1);
                },
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}
