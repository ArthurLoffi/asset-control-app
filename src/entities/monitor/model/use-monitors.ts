import {useEffect, useState} from 'react';
import {monitorApi} from '../api/monitor-api.js';
import type {Monitor, MonitorSearch} from './types.js';
import {ApiError} from '@/shared';

export function useMonitors(search: MonitorSearch) {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setMonitors([]);
        void monitorApi
            .list(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setMonitors(data);
                }
            })
            .catch((requestError: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (
                    search.kind === 'id' &&
                    requestError instanceof ApiError &&
                    requestError.status === 404
                ) {
                    return;
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to load monitors.',
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
        monitors,
        loading,
        error,
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
