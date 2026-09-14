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
import {PhoneForm} from './phone-form';
import {phoneApi, type Phone} from '@/entities';

const existing: Phone = {
    id: 17,
    equipament: 'Celular',
    model: '',
    imei: '',
    serial_number: '',
    has_chip: null,
    situation: 'Em uso',
    employee_id: null,
    created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
    vi.stubGlobal(
        'matchMedia',
        vi
            .fn()
            .mockImplementation(() => ({
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
    vi.spyOn(phoneApi, 'create').mockResolvedValue(existing);
    vi.spyOn(phoneApi, 'update').mockResolvedValue(existing);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function selectEquipment(label: string): void {
    fireEvent.click(screen.getByRole('combobox', {name: 'Company equipment'}));
    fireEvent.click(screen.getByRole('option', {name: label}));
}

describe('phone create and edit forms', () => {
    for (const equipment of [
        {value: 'Só chip', label: 'SIM card only', hasChip: true},
        {value: 'Sem chip', label: 'No SIM card', hasChip: false},
    ]) {
        it.each(['create', 'edit'] as const)(
            `saves ${equipment.label} with blank identifiers in %s mode`,
            async (mode) => {
                const onSaved = vi.fn();
                render(
                    <MantineProvider env="test">
                        <PhoneForm
                            phone={
                                mode === 'edit'
                                    ? {
                                          ...existing,
                                          equipament: equipment.value,
                                          has_chip: equipment.hasChip,
                                      }
                                    : undefined
                            }
                            onClose={vi.fn()}
                            onSaved={onSaved}
                        />
                    </MantineProvider>,
                );
                if (mode === 'create') selectEquipment(equipment.label);
                for (const name of [/^Model/u, /^IMEI/u, /^Serial number/u]) {
                    expect(
                        screen.getByRole<HTMLInputElement>('textbox', {name})
                            .required,
                    ).toBe(false);
                }
                const saveButton = screen.getByRole('button', {
                    name: mode === 'edit' ? 'Save changes' : 'Create phone',
                });
                expect(saveButton.closest('form')?.checkValidity()).toBe(true);
                fireEvent.click(saveButton);
                await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
                const input = {
                    equipament: equipment.value,
                    model: '',
                    imei: '',
                    serial_number: '',
                    has_chip: equipment.hasChip,
                    situation: 'Em uso',
                    employee_id: null,
                };
                if (mode === 'edit') {
                    expect(phoneApi.update).toHaveBeenCalledWith(
                        existing.id,
                        input,
                    );
                    expect(phoneApi.create).not.toHaveBeenCalled();
                } else {
                    expect(phoneApi.create).toHaveBeenCalledWith(input);
                    expect(phoneApi.update).not.toHaveBeenCalled();
                }
            },
        );
    }

    it('updates required fields when equipment changes and preserves entered identifiers', () => {
        render(
            <MantineProvider env="test">
                <PhoneForm
                    phone={{
                        ...existing,
                        model: 'Device',
                        imei: '012345678901234',
                        serial_number: 'SN-1',
                    }}
                    onClose={vi.fn()}
                    onSaved={vi.fn()}
                />
            </MantineProvider>,
        );
        selectEquipment('No SIM card');
        const imei = screen.getByRole<HTMLInputElement>('textbox', {
            name: /^IMEI/u,
        });
        expect(imei.required).toBe(false);
        expect(imei.value).toBe('012345678901234');
        selectEquipment('Mobile phone');
        expect(imei.required).toBe(true);
        expect(imei.value).toBe('012345678901234');
        fireEvent.change(imei, {target: {value: ''}});
        expect(imei.closest('form')?.checkValidity()).toBe(false);
        fireEvent.click(screen.getByRole('button', {name: 'Save changes'}));
        expect(phoneApi.update).not.toHaveBeenCalled();
    });
});
