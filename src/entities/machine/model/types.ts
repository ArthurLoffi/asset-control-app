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

export type Machine = {
    id: number;
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
    created_at: string;
};

export type MachineInput = Omit<Machine, 'id' | 'created_at'>;

export type MachineSearch =
    {kind: 'all'} | {kind: 'id' | 'employee_id'; value: string};
