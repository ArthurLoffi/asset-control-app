import {useEffect, useState} from 'react';
import {organizationApi} from '../api/organization-api.js';
import type {OrganizationOption} from './types.js';

export function useOrganizations() {
    const [branches, setBranches] = useState<OrganizationOption[]>([]);
    const [departments, setDepartments] = useState<OrganizationOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        void organizationApi
            .list(controller.signal)
            .then((result) => {
                if (controller.signal.aborted) {
                    return;
                }

                setBranches(result.branches);
                setDepartments(result.departments);
            })
            .catch((requestError: unknown) => {
                if (!controller.signal.aborted) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'Unable to load organization options.',
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    return {branches, departments, loading, error};
}
