import {afterEach, expect, it, vi} from 'vitest';
import {sessionApi} from './session-api';

afterEach(() => {
    vi.unstubAllGlobals();
});

it('uses the auth API contract without storing a token', async () => {
    const session = {id: 'id', name: 'Ana', expires_at: 1_800_000_000};
    const request = vi.fn(async (path: string, _options: RequestInit) =>
        path.endsWith('/logout')
            ? new Response(null, {status: 204})
            : Response.json(session),
    );
    vi.stubGlobal('fetch', request);
    expect(await sessionApi.login({user: 'Ana', password: ' pass '})).toEqual(
        session,
    );
    expect(JSON.parse(request.mock.calls[0][1].body as string)).toEqual({
        user: 'Ana',
        password: ' pass ',
    });
    const controller = new AbortController();
    await sessionApi.current(controller.signal);
    expect(request.mock.calls[1][0]).toBe('/api/auth/session');
    expect(request.mock.calls[1][1].signal).toBe(controller.signal);
    await expect(sessionApi.logout()).resolves.toBeUndefined();
    expect(request.mock.calls[2][0]).toBe('/api/auth/logout');
    expect(request.mock.calls[2][1].method).toBe('POST');
});
