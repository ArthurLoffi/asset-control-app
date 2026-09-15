// @vitest-environment jsdom
import {StrictMode} from 'react';
import {act, cleanup, renderHook, waitFor} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import {useEmployeeDirectory} from './use-employee-directory';
import {useOrganizations, type EmployeeSearch} from '@/entities';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

it('reuses bulk lists across StrictMode, forms, search, refresh, and remounts', async () => {
    const employee = {
        id: 1,
        name: 'Ana',
        phone: '',
        email: 'ana@example.com',
        branch_id: 2,
        department_id: 3,
        created_at: '2026-09-15T12:00:00Z',
    };
    const request = vi.fn(async (path: string) => {
        if (path === '/api/utils/branches') {
            return Response.json({data: [{id: 2, name: 'Office'}]});
        }

        if (path === '/api/utils/departments') {
            return Response.json({data: [{id: 3, name: 'IT'}]});
        }

        if (path === '/api/employees/id?id=99') {
            return Response.json({error: 'Not found'}, {status: 404});
        }

        return Response.json({
            data:
                path === '/api/employees'
                    ? [
                          employee,
                          {
                              ...employee,
                              id: 2,
                              branch_id: 77,
                              department_id: 88,
                          },
                      ]
                    : employee,
        });
    });
    vi.stubGlobal('fetch', request);
    const initialProps: {search: EmployeeSearch} = {search: {kind: 'all'}};
    const {result, rerender, unmount} = renderHook(
        ({search}) => ({
            directory: useEmployeeDirectory(search),
            form: useOrganizations(),
        }),
        {initialProps, wrapper: StrictMode},
    );
    expect(result.current.directory.loading).toBe(true);
    await waitFor(() => {
        expect(result.current.directory.loading).toBe(false);
    });
    expect(result.current.directory.error).toBe('');
    expect(result.current.directory.employees[0]).toMatchObject({
        branch_name: 'Office',
        department_name: 'IT',
    });
    expect(result.current.directory.employees[1]).toMatchObject({
        branch_name: 'Branch #77',
        department_name: 'Department #88',
    });
    expect(result.current.form.branches).toEqual([{id: 2, name: 'Office'}]);
    rerender({search: {kind: 'id', value: '99'}});
    await waitFor(() => {
        expect(result.current.directory.loading).toBe(false);
    });
    expect(result.current.directory.employees).toEqual([]);
    expect(result.current.directory.error).toBe('');
    rerender({search: {kind: 'name', value: 'Ana'}});
    await waitFor(() => {
        expect(result.current.directory.employees).toHaveLength(1);
    });
    act(() => {
        result.current.directory.reload();
    });
    await waitFor(() => {
        expect(result.current.directory.loading).toBe(false);
    });
    rerender({search: {kind: 'all'}});
    await waitFor(() => {
        expect(result.current.directory.employees).toHaveLength(2);
    });
    unmount();
    const remounted = renderHook(() => useOrganizations());
    await waitFor(() => {
        expect(remounted.result.current.loading).toBe(false);
    });
    expect(
        request.mock.calls
            .map(([path]) => path)
            .filter((path) => path.includes('/utils/')),
    ).toEqual(['/api/utils/branches', '/api/utils/departments']);
});
