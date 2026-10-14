// @vitest-environment jsdom
import {MantineProvider} from '@mantine/core';
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ReactElement} from 'react';
import {
    EmployeeForm,
    MachineForm,
    PhoneForm,
    MonitorForm,
    PrinterForm,
    EmailForm,
} from '@/features';

// Blank identifiers deliberately represent legacy data that cannot pass edit validation.
const record = {
    id: 17,
    created_at: '2026-01-01T00:00:00Z',
    name: 'Test employee',
    user: 'Test user',
    email: 'test@example.com',
    phone: '',
    password_hash: ' secret ',
    branch_id: 1,
    department_id: 1,
    departments_id: 1,
    branch_name: 'Branch',
    department_name: 'Department',
    model: '',
    type: 'PC' as const,
    asset_number: 1,
    serial_number: '',
    has_keyboard: null,
    has_mouse: null,
    machine_condition: null,
    monitor_condition: null,
    situation: 'Em uso' as const,
    employee_id: null,
    has_monitor: null,
    brand: null,
    imei: '',
    has_chip: null,
    equipament: 'Celular',
    ip: '',
};

type FormCase = {
    resource: string;
    form: (onSaved: () => void, isEditing: boolean) => ReactElement;
};
const forms: FormCase[] = [
    {
        resource: 'employees',
        form: (onSaved, isEditing) => (
            <EmployeeForm
                employee={isEditing ? record : undefined}
                onSaved={onSaved}
                onClose={() => undefined}
            />
        ),
    },
    {
        resource: 'machines',
        form: (onSaved, isEditing) => (
            <MachineForm
                machine={isEditing ? record : undefined}
                onSaved={onSaved}
                onClose={() => undefined}
            />
        ),
    },
    {
        resource: 'phones',
        form: (onSaved, isEditing) => (
            <PhoneForm
                phone={isEditing ? record : undefined}
                onSaved={onSaved}
                onClose={() => undefined}
            />
        ),
    },
    {
        resource: 'monitors',
        form: (onSaved, isEditing) => (
            <MonitorForm
                monitor={isEditing ? record : undefined}
                onSaved={onSaved}
                onClose={() => undefined}
            />
        ),
    },
    {
        resource: 'printers',
        form: (onSaved, isEditing) => (
            <PrinterForm
                printer={isEditing ? record : undefined}
                onSaved={onSaved}
                onClose={() => undefined}
            />
        ),
    },
    {
        resource: 'emails',
        form: (onSaved, isEditing) => (
            <EmailForm
                email={isEditing ? record : undefined}
                onSaved={onSaved}
                onDeactivated={onSaved}
                onClose={() => undefined}
            />
        ),
    },
];

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
const emptyPage = {content: [], paging: {has_next: false}};

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe.each(forms)('$resource deactivation', ({resource, form}) => {
    it('locks and fades fields, preserves entered values, and submits only deactivation', async () => {
        const onSaved = vi.fn<() => void>();
        const request = vi.fn(async (path: string, options: RequestInit) =>
            Response.json(
                options.method === 'DELETE' && path.endsWith('/17')
                    ? {id: 17, deactivated_at: '2026-09-16T12:00:00Z'}
                    : emptyPage,
            ),
        );
        vi.stubGlobal('fetch', request);
        render(
            <MantineProvider env="test">{form(onSaved, true)}</MantineProvider>,
        );
        const input = screen.getAllByRole<HTMLInputElement>('textbox')[0];
        fireEvent.change(input, {target: {value: 'unsaved change'}});
        const toggle = screen.getByRole('switch', {name: 'Deactivate record'});
        fireEvent.click(toggle);
        const fieldset = input.closest('fieldset');
        expect(fieldset?.disabled).toBe(true);
        expect(fieldset?.style.opacity).toBe('0.5');
        for (const control of screen.queryAllByRole('combobox')) {
            expect(control.matches(':disabled')).toBe(true);
        }

        fireEvent.click(toggle);
        expect(input.value).toBe('unsaved change');
        expect(fieldset?.disabled).toBe(false);
        fireEvent.click(toggle);
        fireEvent.click(screen.getByRole('button', {name: /^Deactivate /u}));
        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledOnce();
        });
        expect(request).toHaveBeenCalledWith(
            `/api/${resource}/17`,
            expect.objectContaining({method: 'DELETE', credentials: 'include'}),
        );
        const writes = request.mock.calls.filter(
            ([, options]) => options.method !== undefined,
        );
        expect(writes).toHaveLength(1);
        expect(writes[0][1].body).toBeUndefined();
        expect(new Headers(writes[0][1].headers).get('X-CSRF-Protection')).toBe(
            '1',
        );
    });

    it('retains the edit screen after an error and allows retry', async () => {
        const onSaved = vi.fn<() => void>();
        let attempts = 0;
        vi.stubGlobal(
            'fetch',
            vi.fn(async (_path: string, options: RequestInit) => {
                if (options.method === 'DELETE') {
                    attempts++;
                    return attempts === 1
                        ? Response.json(
                              {message: 'Try again', code: 'CORE_003'},
                              {status: 500},
                          )
                        : Response.json({
                              id: 17,
                              deactivated_at: '2026-09-16T12:00:00Z',
                          });
                }

                return Response.json(emptyPage);
            }),
        );
        render(
            <MantineProvider env="test">{form(onSaved, true)}</MantineProvider>,
        );
        fireEvent.click(
            screen.getByRole('switch', {name: 'Deactivate record'}),
        );
        fireEvent.click(screen.getByRole('button', {name: /^Deactivate /u}));
        await screen.findByText('Try again');
        expect(onSaved).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', {name: /^Deactivate /u}));
        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledOnce();
        });
        expect(attempts).toBe(2);
    });

    it('does not offer deactivation when creating a record', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json(emptyPage)),
        );
        render(
            <MantineProvider env="test">
                {form(vi.fn<() => void>(), false)}
            </MantineProvider>,
        );
        expect(
            screen.queryByRole('switch', {name: 'Deactivate record'}),
        ).toBeNull();
    });
});
