import type {ResourceRecord, ResourceInput, CollectionSearch} from '@/shared';

export const printerConditions = ['Novo', 'Bom', 'Ruim'] as const;
export type PrinterCondition = (typeof printerConditions)[number];

export type Printer = ResourceRecord & {
    asset_number: number;
    model: string;
    ip: string;
    machine_condition: PrinterCondition | null; // eslint-disable-line @typescript-eslint/no-restricted-types
    branch_id: number;
    departments_id: number;
};

export type PrinterInput = ResourceInput<Printer>;
export type PrinterSearch = CollectionSearch;
