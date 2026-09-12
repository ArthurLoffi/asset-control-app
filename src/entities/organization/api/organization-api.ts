import type {OrganizationOption} from '../model/types.js';
import {apiRequest} from '@/shared';

export const organizationApi = {
    async list(signal: AbortSignal) {
        const [branches, departments] = await Promise.all([
            apiRequest<OrganizationOption[] | undefined>('/utils/branches', {
                signal,
            }),
            apiRequest<OrganizationOption[] | undefined>('/utils/departments', {
                signal,
            }),
        ]);

        return {branches: branches ?? [], departments: departments ?? []};
    },
};
