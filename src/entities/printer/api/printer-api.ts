import type {Printer, PrinterInput, PrinterSearch} from '../model/types';
import {ApiError, apiRequest} from '@/shared';

export const printerApi = {
    async list(search: PrinterSearch, signal: AbortSignal): Promise<Printer[]> {
        if (search.kind === 'all') {
            return (
                (await apiRequest<Printer[] | undefined>('/printers', {
                    signal,
                })) ?? []
            );
        }

        const query = new URLSearchParams({id: search.value});
        try {
            const printer = await apiRequest<Printer>(
                `/printers/id?${query.toString()}`,
                {signal},
            );
            return [printer];
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return [];
            }

            throw error;
        }
    },

    async create(input: PrinterInput): Promise<void> {
        await apiRequest<Printer>('/printers', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    async update(id: number, input: PrinterInput): Promise<void> {
        await apiRequest<Printer>(`/printers?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    },
};
