import {useEffect, useState} from 'react';
import {printerApi} from '../api/printer-api';
import type {Printer, PrinterSearch} from './types';

export function usePrinters(search: PrinterSearch) {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setPrinters([]);
        void printerApi
            .list(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setPrinters(data);
                }
            })
            .catch((requestError: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to load printers.',
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [search, revision]);

    return {
        printers,
        loading,
        error,
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
