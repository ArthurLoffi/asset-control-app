// @vitest-environment jsdom
import {act, cleanup, render, screen} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import type {ReactElement} from 'react';
import {sessionApi} from '../api/session-api';
import {SessionProvider} from './session-provider';
import {useSession} from './session-context';
import {ApiError} from '@/shared';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
});
function State(): ReactElement {
    const {session, expired, loading} = useSession();
    return (
        <div>
            {loading
                ? 'Loading'
                : (session?.name ?? (expired ? 'Expired' : 'Anonymous'))}
        </div>
    );
}

it('expires the UI at the server-provided deadline without another request', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-15T12:00:00Z'));
    vi.spyOn(sessionApi, 'current').mockResolvedValue({
        id: 'id',
        name: 'Ana',
        expires_at: Math.floor(Date.now() / 1000) + 1,
    });
    await act(async () => {
        render(
            <SessionProvider>
                <State />
            </SessionProvider>,
        );
    });
    expect(screen.getByText('Ana')).toBeDefined();
    await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText('Expired')).toBeDefined();
    expect(sessionApi.current).toHaveBeenCalledTimes(1);
});
it('preserves the expired-session explanation after a page reload', async () => {
    vi.spyOn(sessionApi, 'current').mockRejectedValue(
        new ApiError('session expired', 401, 'AUTH_004'),
    );
    await act(async () => {
        render(
            <SessionProvider>
                <State />
            </SessionProvider>,
        );
    });
    expect(screen.getByText('Expired')).toBeDefined();
});
