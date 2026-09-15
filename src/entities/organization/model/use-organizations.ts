import {useMemo} from 'react';
import {organizationApi} from '../api/organization-api';
import type {OrganizationLists, OrganizationOption} from './types';
import {useResourceQuery} from '@/shared';

const emptyOptions: OrganizationOption[] = [];

async function loadOrganizations(
    _search: 'all',
    signal: AbortSignal,
): Promise<OrganizationLists[]> {
    return [await organizationApi.list(signal)];
}

export function useOrganizations(): OrganizationLists & {
    branchNames: Map<number, string>;
    departmentNames: Map<number, string>;
    loading: boolean;
    error: string;
    reload: () => void;
} {
    const {data, ...query} = useResourceQuery(
        'all',
        loadOrganizations,
        'Unable to load organization options.',
    );
    const branches = data[0]?.branches ?? emptyOptions;
    const departments = data[0]?.departments ?? emptyOptions;
    const branchNames = useMemo(
        () => new Map(branches.map(({id, name}) => [id, name])),
        [branches],
    );
    const departmentNames = useMemo(
        () => new Map(departments.map(({id, name}) => [id, name])),
        [departments],
    );
    return {...query, branches, departments, branchNames, departmentNames};
}
