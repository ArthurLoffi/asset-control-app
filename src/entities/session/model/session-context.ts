import {createContext, useContext} from 'react';
import type {Session} from './types';

export type SessionState = {
    session: Session | undefined;
    loading: boolean;
    error: string | undefined;
    expired: boolean;
    signedOut: boolean;
    acceptSession: (session: Session) => void;
    clearSession: () => void;
    retry: () => void;
};
export const SessionContext = createContext<SessionState | undefined>(
    undefined,
);
export function useSession(): SessionState {
    const value = useContext(SessionContext);
    if (!value) {
        throw new Error('useSession requires SessionProvider');
    }

    return value;
}
