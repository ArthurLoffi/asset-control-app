import type {ResourceRecord, ResourceInput, CollectionSearch} from '@/shared';

export const phoneEquipmentOptions = [
    {value: 'Celular', label: 'Mobile phone'},
    {value: 'Só chip', label: 'SIM card only'},
    {value: 'Sem chip', label: 'No SIM card'},
] as const;

export const phoneSituations = [
    'Em uso',
    'Sem uso',
    'Com defeito',
    'Uso temporário',
    'Manutenção',
] as const;

export type PhoneSituation = (typeof phoneSituations)[number];
type Nullable<T> = T | null; // eslint-disable-line @typescript-eslint/no-restricted-types

export type Phone = ResourceRecord & {
    equipament: Nullable<string>;
    model: string;
    imei: string;
    serial_number: string;
    has_chip: Nullable<boolean>;
    situation: PhoneSituation;
    employee_id: Nullable<number>;
    employee_ids?: number[];
};

export type PhoneInput = ResourceInput<Phone>;

export type PhoneSearch = CollectionSearch<
    'id' | 'employee_id' | 'employee_name'
>;
