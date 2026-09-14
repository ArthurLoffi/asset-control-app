import type {ResourceRecord, ResourceInput, CollectionSearch} from '@/shared';

export const machineTypes = ['Notebook', 'PC'] as const;
export const machineConditions = ['Novo', 'Bom', 'Ruim'] as const;
export const machineSituations = [
    'Em uso',
    'Sem uso',
    'Com defeito',
    'Uso temporário',
    'Manutenção',
] as const;

export type MachineType = (typeof machineTypes)[number];
export type MachineCondition = (typeof machineConditions)[number];
export type MachineSituation = (typeof machineSituations)[number];
type Nullable<T> = T | null; // eslint-disable-line @typescript-eslint/no-restricted-types

export type Machine = ResourceRecord & {
    user: string;
    asset_number: Nullable<number>;
    type: MachineType;
    model: string;
    serial_number: string;
    has_keyboard: Nullable<boolean>;
    has_mouse: Nullable<boolean>;
    machine_condition: Nullable<MachineCondition>;
    situation: MachineSituation;
    employee_id: Nullable<number>;
};

export type MachineInput = ResourceInput<Machine>;

export type MachineSearch = CollectionSearch<
    'id' | 'employee_id' | 'employee_name'
>;
