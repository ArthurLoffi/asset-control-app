import {afterEach, expect, it, vi} from 'vitest';
import {apiRequest, ApiError, onUnauthorized} from './client';

afterEach(() => {
    vi.unstubAllGlobals();
});

it('sends cookies and CSRF protection with JSON requests', async () => {
    const request = vi.fn(async () => Response.json({data: {id: 1}}));
    vi.stubGlobal('fetch', request);
    expect(await apiRequest('/test', {method: 'POST', body: '{}'})).toEqual({
        id: 1,
    });
    const options = request.mock.calls[0] as unknown as [string, RequestInit];
    expect(options[0]).toBe('/api/test');
    expect(options[1].credentials).toBe('include');
    expect(new Headers(options[1].headers).get('X-CSRF-Protection')).toBe('1');
    expect(new Headers(options[1].headers).get('Content-Type')).toBe(
        'application/json',
    );
});

it('notifies session consumers only for unauthorized resource requests', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
            Response.json(
                {error: 'session expired'},
                {
                    status: 401,
                },
            ),
        ),
    );
    const listener = vi.fn<() => void>();
    const unsubscribe = onUnauthorized(listener);
    try {
        await expect(apiRequest('/auth/login')).rejects.toBeInstanceOf(
            ApiError,
        );
        expect(listener).not.toHaveBeenCalled();
        await expect(apiRequest('/emails')).rejects.toThrow('session expired');
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
        await expect(apiRequest('/emails')).rejects.toBeInstanceOf(ApiError);
        expect(listener).toHaveBeenCalledTimes(1);
    } finally {
        unsubscribe();
    }
});

it('does not expire a new session from an aborted request', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
            controller.abort();
            return new Response('{}', {status: 401});
        }),
    );
    const listener = vi.fn<() => void>();
    const unsubscribe = onUnauthorized(listener);
    try {
        await expect(
            apiRequest('/emails', {signal: controller.signal}),
        ).rejects.toThrow();
        expect(listener).not.toHaveBeenCalled();
    } finally {
        unsubscribe();
    }
});
