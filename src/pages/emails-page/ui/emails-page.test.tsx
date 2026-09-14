// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {EmailsPage} from './emails-page';

const original = {
    id: 42,
    user: 'Ana',
    email: 'ana@example.com',
    password_hash: ' plain<&>text ',
    created_at: '2026-09-14T12:00:00Z',
};

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

function openPage() {
    render(
        <MantineProvider env="test">
            <EmailsPage />
        </MantineProvider>,
    );
}

describe('email screen with mocked API', () => {
    it('lists by default, searches, edits, and restores the list on clear', async () => {
        let record = {...original};
        const request = vi.fn(async (path: string, options: RequestInit) => {
            if (options.method === 'PUT') {
                record = {
                    ...record,
                    ...(JSON.parse(
                        typeof options.body === 'string' ? options.body : '{}',
                    ) as typeof original),
                };
            }

            return Response.json({
                data: path === '/api/emails' ? [record] : record,
            });
        });
        vi.stubGlobal('fetch', request);
        openPage();
        await screen.findByText('ana@example.com');
        expect(request).toHaveBeenCalledWith('/api/emails', expect.anything());
        fireEvent.change(screen.getByLabelText('User'), {
            target: {value: 'Ana'},
        });
        fireEvent.click(screen.getByRole('button', {name: 'Search'}));
        await screen.findByText('ana@example.com');
        const password = screen.getByLabelText<HTMLInputElement>(
            'Password for ana@example.com',
        );
        expect(password.type).toBe('password');
        fireEvent.keyDown(
            screen.getByRole('button', {
                name: 'Toggle password for ana@example.com',
            }),
            {key: 'Enter'},
        );
        expect(password.type).toBe('text');
        expect(password.value).toBe(original.password_hash);
        fireEvent.click(
            screen.getByRole('button', {name: 'Edit ana@example.com'}),
        );
        await screen.findByRole('dialog');
        fireEvent.change(
            within(screen.getByRole('dialog')).getByRole('textbox', {
                name: /^User/u,
            }),
            {
                target: {value: 'Renamed'},
            },
        );
        fireEvent.change(
            within(screen.getByRole('dialog')).getByLabelText(/^Password/u),
            {
                target: {value: ' changed password '},
            },
        );
        fireEvent.click(screen.getByRole('button', {name: 'Save changes'}));
        await screen.findByText('Email updated successfully.');
        await screen.findByText('Renamed');
        expect(request).toHaveBeenCalledWith(
            '/api/emails?id=42',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({
                    user: 'Renamed',
                    email: original.email,
                    password_hash: ' changed password ',
                }),
            }),
        );
        expect(request).toHaveBeenLastCalledWith(
            '/api/emails/id?id=42',
            expect.anything(),
        );
        const count = request.mock.calls.length;
        fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
        await screen.findByText('Renamed');
        expect(request).toHaveBeenCalledTimes(count + 1);
        expect(request).toHaveBeenLastCalledWith(
            '/api/emails',
            expect.anything(),
        );
    });

    it('keeps a failed create form open for retry and then displays the generated ID', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(Response.json({data: []}))
            .mockResolvedValueOnce(
                Response.json({error: 'Unable to save'}, {status: 500}),
            )
            .mockResolvedValueOnce(Response.json({data: original}))
            .mockImplementation(async () => Response.json({data: original}));
        vi.stubGlobal('fetch', request);
        openPage();
        await screen.findByText('No emails yet');
        fireEvent.click(screen.getByRole('button', {name: 'New email'}));
        await screen.findByRole('dialog');
        fireEvent.change(
            within(screen.getByRole('dialog')).getByRole('textbox', {
                name: /^User/u,
            }),
            {
                target: {value: 'Ana'},
            },
        );
        fireEvent.change(screen.getByLabelText(/^Email address/u), {
            target: {value: original.email},
        });
        fireEvent.change(screen.getByLabelText(/^Password/u), {
            target: {value: original.password_hash},
        });
        fireEvent.click(screen.getByRole('button', {name: 'Create email'}));
        await screen.findByText('Unable to save');
        expect(
            screen.getByLabelText<HTMLInputElement>(/^Password/u).value,
        ).toBe(original.password_hash);
        fireEvent.click(screen.getByRole('button', {name: 'Create email'}));
        await screen.findByText('Email created successfully.');
        await screen.findByText('ID #42');
        expect(request).toHaveBeenLastCalledWith(
            '/api/emails/id?id=42',
            expect.anything(),
        );
    });

    it('shows not-found and server errors, then refreshes successfully', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(Response.json({data: []}))
            .mockResolvedValueOnce(
                Response.json({error: 'not found'}, {status: 404}),
            )
            .mockResolvedValueOnce(
                Response.json({error: 'Offline'}, {status: 500}),
            )
            .mockResolvedValueOnce(Response.json({data: original}));
        vi.stubGlobal('fetch', request);
        openPage();
        await screen.findByText('No emails yet');
        fireEvent.change(screen.getByLabelText('User'), {
            target: {value: 'missing'},
        });
        fireEvent.click(screen.getByRole('button', {name: 'Search'}));
        await screen.findByText('No email found');
        fireEvent.click(screen.getByRole('button', {name: 'Refresh'}));
        await screen.findByText('Offline');
        fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
        await screen.findByText('ana@example.com');
        await waitFor(() => {
            expect(screen.queryByText('Offline')).toBeNull();
        });
    });

    it('paginates the default list and resets pagination after a search is cleared', async () => {
        const records = Array.from({length: 11}, (_, index) => ({
            ...original,
            id: index + 1,
            user: `User ${index + 1}`,
            email: `user${index + 1}@example.com`,
        }));
        const request = vi.fn(async (path: string) =>
            Response.json({
                data: path === '/api/emails' ? records : records[0],
            }),
        );
        vi.stubGlobal('fetch', request);
        openPage();
        await screen.findByText('Showing 1–10 of 11 emails');
        expect(screen.queryByText('user11@example.com')).toBeNull();
        fireEvent.click(screen.getByRole('button', {name: '2'}));
        await screen.findByText('user11@example.com');
        expect(screen.queryByText('user1@example.com')).toBeNull();
        fireEvent.change(screen.getByLabelText('User'), {
            target: {value: 'User 1'},
        });
        fireEvent.click(screen.getByRole('button', {name: 'Search'}));
        await screen.findByText('Showing 1–1 of 1 emails');
        fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
        await screen.findByText('Showing 1–10 of 11 emails');
    });

    it('retries a failed initial list request', async () => {
        const request = vi
            .fn()
            .mockResolvedValueOnce(
                Response.json({error: 'List unavailable'}, {status: 500}),
            )
            .mockResolvedValueOnce(Response.json({data: [original]}));
        vi.stubGlobal('fetch', request);
        openPage();
        await screen.findByText('List unavailable');
        fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
        await screen.findByText('ana@example.com');
        expect(request).toHaveBeenLastCalledWith(
            '/api/emails',
            expect.anything(),
        );
    });
});
