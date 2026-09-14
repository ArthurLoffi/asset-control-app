export const printerConditions = ['Novo', 'Bom', 'Ruim'] as const;
export type PrinterCondition = (typeof printerConditions)[number];

export type Printer = {
    id: number;
    asset_number: number;
    model: string;
    ip: string;
    machine_condition: PrinterCondition | null; // eslint-disable-line @typescript-eslint/no-restricted-types
    branch_id: number;
    departments_id: number;
    created_at: string;
};

export type PrinterInput = Omit<Printer, 'id' | 'created_at'>;
export type PrinterSearch = {kind: 'all'} | {kind: 'id'; value: string};
