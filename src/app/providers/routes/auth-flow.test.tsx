// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import AppRouter from './app-routes';
import {SessionProvider} from '@/entities';
import {apiRequest} from '@/shared';

beforeEach(() => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    );
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        },
    );
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

function openApp(path = '/emails'): void {
    render(
        <MantineProvider env="test">
            <MemoryRouter initialEntries={[path]}>
                <SessionProvider>
                    <AppRouter />
                </SessionProvider>
            </MemoryRouter>
        </MantineProvider>,
    );
}

function json(data: unknown, status = 200): Response {
    return Response.json(status === 200 ? {data} : {error: data}, {status});
}

it('protects deep links, reports login failures, signs in and handles logout failure and success', async () => {
    let isLoggedIn = false;
    let isLogoutFails = true;
    const session = {
        id: 'id',
        name: 'Ana',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    const request = vi.fn(async (path: string, options: RequestInit) => {
        if (path === '/api/auth/session') {
            return json('authentication required', 401);
        }

        if (path === '/api/auth/login') {
            const input = JSON.parse(options.body as string) as {
                password: string;
            };
            if (input.password !== ' pass ') {
                return json('invalid username or password', 401);
            }

            isLoggedIn = true;
            return json(session);
        }

        if (path === '/api/auth/logout') {
            if (isLogoutFails) {
                return json('unable to sign out', 500);
            }

            isLoggedIn = false;
            return json(undefined);
        }

        expect(isLoggedIn).toBe(true);
        return json([]);
    });
    vi.stubGlobal('fetch', request);
    openApp();
    await screen.findByRole('button', {name: 'Sign in'});
    expect(
        request.mock.calls.every(([path]) => path === '/api/auth/session'),
    ).toBe(true);
    fireEvent.change(screen.getByLabelText('Username', {exact: false}), {
        target: {value: ' Ana '},
    });
    fireEvent.change(
        screen.getByLabelText('Password', {exact: false, selector: 'input'}),
        {
            target: {value: 'wrong'},
        },
    );
    fireEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    await screen.findByText('invalid username or password');
    fireEvent.change(
        screen.getByLabelText('Password', {exact: false, selector: 'input'}),
        {
            target: {value: ' pass '},
        },
    );
    fireEvent.click(screen.getByRole('button', {name: 'Sign in'}));
    await screen.findByRole('button', {name: 'Sign out'});
    expect(screen.getByText('Ana')).toBeDefined();
    await waitFor(() => {
        expect(
            request.mock.calls.some(([path]) => path === '/api/emails'),
        ).toBe(true);
    });
    fireEvent.click(screen.getByRole('button', {name: 'Sign out'}));
    await screen.findByText('unable to sign out');
    expect(screen.getByRole('button', {name: 'Sign out'})).toBeDefined();
    isLogoutFails = false;
    fireEvent.click(screen.getByRole('button', {name: 'Sign out'}));
    await screen.findByText('You have been signed out.');
    expect(screen.getByRole('button', {name: 'Sign in'})).toBeDefined();
});

it('keeps inventory hidden during session failures and supports retry', async () => {
    let isRetry = false;
    const request = vi.fn(async () =>
        isRetry
            ? json('authentication required', 401)
            : json('service unavailable', 503),
    );
    vi.stubGlobal('fetch', request);
    openApp();
    await screen.findByText('Unable to check your session');
    expect(screen.queryByRole('button', {name: 'Sign in'})).toBeNull();
    isRetry = true;
    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    await screen.findByRole('button', {name: 'Sign in'});
    expect(request).toHaveBeenCalledTimes(2);
});

it('removes inventory and asks for login when an API request rejects the session', async () => {
    let isExpired = false;
    vi.stubGlobal(
        'fetch',
        vi.fn(async (path: string) => {
            if (path === '/api/auth/session') {
                return json({
                    id: 'id',
                    name: 'Ana',
                    expires_at: Math.floor(Date.now() / 1000) + 3600,
                });
            }

            return isExpired ? json('session expired', 401) : json([]);
        }),
    );
    openApp();
    await screen.findByRole('button', {name: 'Sign out'});
    isExpired = true;
    await act(async () => {
        await expect(apiRequest('/emails')).rejects.toThrow('session expired');
    });
    await screen.findByText('Your session expired. Please sign in again.');
    expect(screen.queryByRole('button', {name: 'Sign out'})).toBeNull();
});
