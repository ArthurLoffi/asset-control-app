import type {LookupSearch} from '../model/resource';
import {ApiError, apiRequest} from './client';

let inventoryRevision = 0;

export function getInventoryRevision(): number {
    return inventoryRevision;
}

export type Page<T> = {
    content: T[];
    paging: {
        total_elements: number;
        size: number;
        page: number;
        total_pages: number;
        has_content: boolean;
        has_next: boolean;
        has_previous: boolean;
    };
};

// Repeated values (arrays) become repeated parameters, e.g. employee_id=1&employee_id=2.
export type ListFilters = Record<string, string | string[]>;

const maximumPageSize = 100;

/**
 Read every page of GET <path>. Screens still sort and paginate locally, so
 they need the complete active list; the API caps page_size at 100.
 */
export async function listAll<T>(
    path: string,
    filters: ListFilters = {},
    signal?: AbortSignal,
): Promise<T[]> {
    const records: T[] = [];
    for (let page = 0; ; page++) {
        const query = new URLSearchParams({
            page: String(page),
            page_size: String(maximumPageSize),
        });
        for (const [key, value] of Object.entries(filters)) {
            for (const item of [value].flat()) {
                query.append(key, item);
            }
        }

        // eslint-disable-next-line no-await-in-loop
        const result = await apiRequest<Page<T>>(
            `${path}?${query.toString()}`,
            {
                signal,
            },
        );
        records.push(...result.content);
        if (!result.paging.has_next) {
            return records;
        }
    }
}

/**
 Find one record by id; a missing record is an empty result, not an error.
 */
export async function findResource<T>(
    path: string,
    search: LookupSearch<string>,
    signal: AbortSignal,
): Promise<T[]> {
    if (search.kind !== 'id') {
        return listAll<T>(path, {[search.kind]: search.value}, signal);
    }

    try {
        return [
            await apiRequest<T>(`${path}/${encodeURIComponent(search.value)}`, {
                signal,
            }),
        ];
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return [];
        }

        throw error;
    }
}

export function createResourceWriter<T, Input>(path: string) {
    async function write<Result>(
        target: string,
        options: RequestInit,
    ): Promise<Result> {
        const result = await apiRequest<Result>(target, options);
        inventoryRevision++;
        return result;
    }

    return {
        async deactivate(
            id: number,
        ): Promise<{id: number; deactivated_at: string}> {
            return write(`${path}/${id}`, {method: 'DELETE'});
        },
        async create(input: Input): Promise<T> {
            return write(path, {method: 'POST', body: JSON.stringify(input)});
        },
        async update(id: number, input: Input): Promise<T> {
            return write(`${path}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(input),
            });
        },
    };
}

type EquipmentSearch =
    | LookupSearch<'id' | 'employee_id' | 'employee_name'>
    | {kind: 'all' | 'unassigned'};

/**
 List machines, monitors, or phones. Employee names resolve to IDs first,
 then one request asks for equipment assigned to any of them.
 */
export async function listEquipment<T>(
    path: string,
    search: EquipmentSearch,
    signal: AbortSignal,
    findEmployeeIds: (name: string, signal: AbortSignal) => Promise<number[]>,
): Promise<T[]> {
    switch (search.kind) {
        case 'all': {
            return listAll<T>(path, {}, signal);
        }

        case 'unassigned': {
            return listAll<T>(path, {unassigned: 'true'}, signal);
        }

        case 'employee_id': {
            return listAll<T>(path, {employee_id: search.value}, signal);
        }

        case 'employee_name': {
            const employeeIds = await findEmployeeIds(search.value, signal);
            return employeeIds.length === 0
                ? []
                : listAll<T>(
                      path,
                      {employee_id: employeeIds.map(String)},
                      signal,
                  );
        }

        case 'id': {
            return findResource<T>(path, search, signal);
        }
    }
}
