import type {Printer, PrinterInput, PrinterSearch} from '../model/types';
import {createResourceWriter, findResource, listAll} from '@/shared';

export const printerApi = {
    ...createResourceWriter<Printer, PrinterInput>('/printers'),
    async list(search: PrinterSearch, signal: AbortSignal): Promise<Printer[]> {
        return search.kind === 'all'
            ? listAll<Printer>('/printers', {}, signal)
            : findResource<Printer>('/printers', search, signal);
    },
};
