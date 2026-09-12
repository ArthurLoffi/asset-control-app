export const monitorConditions = ['Novo', 'Bom', 'Ruim'] as const;
export const monitorSituations = [
    'Em uso',
    'Sem uso',
    'Com defeito',
    'Uso temporário',
    'Manutenção',
] as const;

export type MonitorCondition = (typeof monitorConditions)[number];
export type MonitorSituation = (typeof monitorSituations)[number];
type Nullable<T> = T | null; // eslint-disable-line @typescript-eslint/no-restricted-types

export type Monitor = {
    id: number;
    has_monitor: Nullable<boolean>;
    asset_number: Nullable<number>;
    brand: Nullable<string>;
    model: string;
    serial_number: Nullable<string>;
    monitor_condition: Nullable<MonitorCondition>;
    situation: MonitorSituation;
    employee_id: Nullable<number>;
    created_at: string;
};

export type MonitorInput = Omit<Monitor, 'id' | 'created_at'>;

export type MonitorSearch =
    | {kind: 'all'}
    | {kind: 'id' | 'employee_id' | 'employee_name'; value: string};
