import type {LookupSearch} from '../model/resource';
import {ApiError, apiRequest} from './client';

let inventoryRevision = 0;

export function getInventoryRevision(): number {
    return inventoryRevision;
}

export function createResourceWriter<T, Input>(path: string) {
    return {
        async deactivate(
            id: number,
        ): Promise<{id: number; deactivated_at: string}> {
            const query = new URLSearchParams({id: String(id)});
            const result = await apiRequest<{
                id: number;
                deactivated_at: string;
            }>(`${path}/deactivate?${query.toString()}`, {
                method: 'POST',
            });
            inventoryRevision++;
            return result;
        },
        async create(input: Input): Promise<T> {
            const result = await apiRequest<T>(path, {
                method: 'POST',
                body: JSON.stringify(input),
            });
            inventoryRevision++;
            return result;
        },
        async update(id: number, input: Input): Promise<T> {
            const query = new URLSearchParams({id: String(id)});
            const result = await apiRequest<T>(`${path}?${query.toString()}`, {
                method: 'PUT',
                body: JSON.stringify(input),
            });
            inventoryRevision++;
            return result;
        },
    };
}

export async function findResource<T>(
    path: string,
    search: LookupSearch<string>,
    signal: AbortSignal,
): Promise<T[]> {
    const query = new URLSearchParams({[search.kind]: search.value});
    try {
        return [
            await apiRequest<T>(`${path}/${search.kind}?${query.toString()}`, {
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
