// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {cleanup, render, screen, within} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {RecentChangesTable} from './recent-changes-table';
import {i18n} from '@/shared';

beforeEach(async () => {
    await i18n.changeLanguage('en');
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

describe('RecentChangesTable', () => {
    it('shows an empty audit feed without substituting recently created records', () => {
        render(
            <MantineProvider env="test">
                <MemoryRouter>
                    <RecentChangesTable changes={[]} />
                </MemoryRouter>
            </MantineProvider>,
        );
        expect(screen.getByText('No changes recorded yet.')).toBeTruthy();
    });

    it('shows changed values and the editor name with each audit entry', () => {
        render(
            <MantineProvider env="test">
                <MemoryRouter>
                    <RecentChangesTable
                        changes={[
                            {
                                id: 'audit-1',
                                time: '2026-09-22T12:30:00Z',
                                user_id: 'editor-7',
                                user_name: 'Ana',
                                resource: 'machines',
                                resource_id: 42,
                                action: 'update',
                                changed_fields: [
                                    {
                                        field: 'model',
                                        before: 'Old',
                                        after: 'New',
                                    },
                                ],
                            },
                        ]}
                    />
                </MemoryRouter>
            </MantineProvider>,
        );
        const table = screen.getByRole('table', {name: 'Latest changes'});
        const row = within(table).getAllByRole('row')[1];
        expect(
            within(row)
                .getByRole('link', {name: 'Machine'})
                .getAttribute('href'),
        ).toBe('/machines');
        expect(within(row).getByText('42')).toBeTruthy();
        expect(within(row).getByText('Ana')).toBeTruthy();
        expect(within(row).getByText(/Old → New/u)).toBeTruthy();
        expect(within(row).queryByText('editor-7')).toBeNull();
        expect(within(row).getByText(/2026/u)).toBeTruthy();
    });
});
