import {printerApi} from '../api/printer-api';
import type {PrinterSearch} from './types';
import {useResourceQuery} from '@/shared';

export function usePrinters(search: PrinterSearch) {
    const {data: printers, ...state} = useResourceQuery(
        search,
        printerApi.list,
        'Unable to load printers.',
    );
    return {printers, ...state};
}
