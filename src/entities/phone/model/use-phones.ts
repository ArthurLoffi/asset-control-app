import {useEffect, useState} from 'react';
import {phoneApi} from '../api/phone-api.js';
import type {Phone, PhoneSearch} from './types.js';
import {ApiError} from '@/shared/api/index.js';

export function usePhones(search: PhoneSearch) {
    const [phones, setPhones] = useState<Phone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setPhones([]);
        void phoneApi
            .list(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setPhones(data);
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
                        : 'Unable to load phones.',
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
        phones,
        loading,
        error,
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
