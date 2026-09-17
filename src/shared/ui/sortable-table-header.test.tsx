// @vitest-environment jsdom
import {MantineProvider, Table} from '@mantine/core';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {useState, type ReactElement} from 'react';
import {afterEach, expect, it, vi} from 'vitest';
import {i18n} from '../config/i18n';
import type {TableSort} from '../model/table-sort';
import {SortableTableHeader} from './sortable-table-header';

function SortableTable(): ReactElement {
    const [sort, setSort] = useState<TableSort<'name'>>();
    return (
        <MantineProvider env="test">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <SortableTableHeader
                            column="name"
                            label="Name"
                            sort={sort}
                            onSort={(column) => {
                                setSort((current) => ({
                                    key: column,
                                    direction:
                                        current?.direction === 'asc'
                                            ? 'desc'
                                            : 'asc',
                                }));
                            }}
                        />
                    </Table.Tr>
                </Table.Thead>
            </Table>
        </MantineProvider>
    );
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

it('toggles the visible and accessible sort direction', async () => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    );
    await i18n.changeLanguage('en');
    render(<SortableTable />);

    const ascending = screen.getByRole('button', {
        name: 'Sort Name ascending',
    });
    expect(ascending.closest('th')?.getAttribute('aria-sort')).toBe('none');
    fireEvent.click(ascending);

    const descending = screen.getByRole('button', {
        name: 'Sort Name descending',
    });
    expect(descending.closest('th')?.getAttribute('aria-sort')).toBe(
        'ascending',
    );
    fireEvent.click(descending);

    expect(
        screen
            .getByRole('button', {name: 'Sort Name ascending'})
            .closest('th')
            ?.getAttribute('aria-sort'),
    ).toBe('descending');
});
