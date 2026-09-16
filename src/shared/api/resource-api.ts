import type {LookupSearch} from '../model/resource';
import {ApiError, apiRequest} from './client';

export function createResourceWriter<T, Input>(path: string) {
    return {
        async deactivate(
            id: number,
        ): Promise<{id: number; deactivated_at: string}> {
            const query = new URLSearchParams({id: String(id)});
            return apiRequest(`${path}/deactivate?${query.toString()}`, {
                method: 'POST',
            });
        },
        async create(input: Input): Promise<T> {
            return apiRequest<T>(path, {
                method: 'POST',
                body: JSON.stringify(input),
            });
        },
        async update(id: number, input: Input): Promise<T> {
            const query = new URLSearchParams({id: String(id)});
            return apiRequest<T>(`${path}?${query.toString()}`, {
                method: 'PUT',
                body: JSON.stringify(input),
            });
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
