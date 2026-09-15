// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import {EmployeesPage} from './employees-page';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

it('uses cached lists while paginating, searching, and editing employees', async () => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
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
    const employees = Array.from({length: 12}, (_, index) => ({
        id: index + 1,
        name: `Person ${index + 1}`,
        email: `person${index + 1}@example.com`,
        phone: '',
        branch_id: 2,
        department_id: 3,
        created_at: '2026-09-15T12:00:00Z',
    }));
    let hasOrganizationError = true;
    let hasSaveError = true;
    const request = vi.fn(async (path: string, options: RequestInit) => {
        if (path === '/api/utils/branches') {
            return Response.json({data: [{id: 2, name: 'Office'}]});
        }

        if (path === '/api/utils/departments') {
            return hasOrganizationError
                ? Response.json(
                      {error: 'Departments unavailable'},
                      {status: 500},
                  )
                : Response.json({data: [{id: 3, name: 'IT'}]});
        }

        if (options.method === 'PUT') {
            if (hasSaveError) {
                return Response.json(
                    {error: 'Save unavailable'},
                    {status: 500},
                );
            }

            employees[0].name = 'Updated person';
            return Response.json({data: employees[0]});
        }

        if (path.includes('/employees/name?')) {
            return Response.json({error: 'Not found'}, {status: 404});
        }

        return Response.json({data: employees});
    });
    vi.stubGlobal('fetch', request);
    render(
        <MantineProvider env="test">
            <EmployeesPage />
        </MantineProvider>,
    );
    expect(screen.queryByRole('table')).toBeNull();
    await screen.findByText('Departments unavailable');
    hasOrganizationError = false;
    fireEvent.click(screen.getByRole('button', {name: 'Refresh'}));
    await screen.findByRole('table', {name: 'Employee directory'});
    expect(screen.getAllByText('Office')).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', {name: '2'}));
    expect(screen.getByText('Person 12')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: '1'}));
    fireEvent.click(screen.getByRole('button', {name: 'Edit Person 1'}));
    const branch = screen.getByRole<HTMLInputElement>('combobox', {
        name: 'Branch',
    });
    await waitFor(() => {
        expect(branch.disabled).toBe(false);
    });
    expect(branch.value).toBe('Office');
    expect(
        screen.getByRole<HTMLInputElement>('combobox', {name: 'Department'})
            .value,
    ).toBe('IT');
    const name = screen.getByRole<HTMLInputElement>('textbox', {
        name: 'Full name',
    });
    fireEvent.change(name, {target: {value: ''}});
    expect(name.checkValidity()).toBe(false);
    fireEvent.change(name, {target: {value: 'Updated person'}});
    fireEvent.click(screen.getByRole('button', {name: 'Save changes'}));
    await screen.findByText('Save unavailable');
    hasSaveError = false;
    fireEvent.click(screen.getByRole('button', {name: 'Save changes'}));
    await screen.findByText('Employee updated successfully.');
    await screen.findByText('Updated person');
    fireEvent.change(screen.getByRole('textbox', {name: 'Employee name'}), {
        target: {value: 'Missing'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Search'}));
    await screen.findByRole('button', {name: 'Show all employees'});
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    await screen.findByText('Updated person');
    expect(screen.getAllByText('Office')).toHaveLength(10);
    expect(
        request.mock.calls
            .map(([path]) => path)
            .filter((path) => path.includes('/utils/')),
    ).toEqual([
        '/api/utils/branches',
        '/api/utils/departments',
        '/api/utils/departments',
    ]);
    const writes = request.mock.calls.filter(
        ([, options]) => options.method === 'PUT',
    );
    expect(writes).toHaveLength(2);
    const {body} = writes[1][1];
    if (typeof body !== 'string') {
        throw new TypeError('Expected a JSON request body.');
    }

    expect(JSON.parse(body)).toMatchObject({
        name: 'Updated person',
        branch_id: 2,
        department_id: 3,
    });
}, 15_000);
