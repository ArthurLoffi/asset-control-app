import {useEffect, useState} from 'react';
import {machineApi} from '../api/machine-api.js';
import type {Machine, MachineSearch} from './types.js';
import {ApiError} from '@/shared/api/index.js';

export function useMachines(search: MachineSearch) {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setMachines([]);

        void machineApi
            .list(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setMachines(data);
                }
            })
            .catch((requestError: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (
                    search.kind !== 'all' &&
                    requestError instanceof ApiError &&
                    requestError.status === 404
                ) {
                    return;
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to load machines.',
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
        machines,
        loading,
        error,
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
