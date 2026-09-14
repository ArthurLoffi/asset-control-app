import type {Printer, PrinterInput, PrinterSearch} from '../model/types';
import {apiRequest, createResourceWriter, findResource} from '@/shared';

export const printerApi = {
    ...createResourceWriter<Printer, PrinterInput>('/printers'),
    async list(search: PrinterSearch, signal: AbortSignal): Promise<Printer[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Printer[] | undefined>('/printers', {
                    signal,
                })) ?? []
            );
        }

        return findResource<Printer>('/printers', search, signal);
    },
};
