import type {OrganizationLists, OrganizationOption} from '../model/types';
import {listAll} from '@/shared';

const lists = new Map<string, Promise<OrganizationOption[]>>();

async function loadList(path: string): Promise<OrganizationOption[]> {
    let pending = lists.get(path);
    if (!pending) {
        // Reference lists live until a full page reload. Shared requests survive
        // individual unmounts, including React StrictMode's effect cleanup.
        pending = listAll<OrganizationOption>(path)
            .then((items) =>
                items.toSorted((left, right) => {
                    const order = left.name.localeCompare(right.name);
                    return order === 0 ? left.id - right.id : order;
                }),
            )
            .catch((error: unknown) => {
                lists.delete(path);
                throw error;
            });
        lists.set(path, pending);
    }

    return pending;
}

export const organizationApi = {
    async list(signal: AbortSignal): Promise<OrganizationLists> {
        signal.throwIfAborted();
        // Cancel only this caller's subscription; other pages/forms still need
        // the same in-flight request. Failed lists can be retried.
        return new Promise<OrganizationLists>((resolve, reject) => {
            const onAbort = (): void => {
                reject(
                    new DOMException('The request was aborted.', 'AbortError'),
                );
            };

            signal.addEventListener('abort', onAbort, {once: true});
            void Promise.all([loadList('/branches'), loadList('/departments')])
                .then(([branches, departments]) => {
                    signal.throwIfAborted();
                    resolve({branches, departments});
                })
                .catch(reject)
                .finally(() => {
                    signal.removeEventListener('abort', onAbort);
                });
        });
    },
};
