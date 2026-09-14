import {useEffect, useState} from 'react';
import {employeeApi} from '../api/employee-api';
import type {Employee, EmployeeSearch} from './types';
import {ApiError} from '@/shared';

export function useEmployees(search: EmployeeSearch) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        setEmployees([]);
        void employeeApi
            .list(search, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setEmployees(data);
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
                        : 'Unable to load employees.',
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
        employees,
        loading,
        error,
        reload() {
            setRevision((value) => value + 1);
        },
    };
}
