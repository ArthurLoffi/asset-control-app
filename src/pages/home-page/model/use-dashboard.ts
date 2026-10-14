import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {
    summarizeDashboard,
    type DashboardSnapshot,
    type RecentChange,
} from './dashboard';
import {
    employeeApi,
    machineApi,
    monitorApi,
    phoneApi,
    printerApi,
    organizationApi,
} from '@/entities';
import {
    apiRequest,
    getInventoryRevision,
    type Page,
    useResourceQuery,
} from '@/shared';

const allRecords = {kind: 'all'} as const;
type DashboardData = DashboardSnapshot & {changes: RecentChange[]};
let pendingDashboard:
    {revision: number; request: Promise<DashboardData[]>} | undefined;

export async function loadDashboard(
    _search: 'all',
    signal: AbortSignal,
): Promise<DashboardData[]> {
    signal.throwIfAborted();
    const revision = getInventoryRevision();
    if (pendingDashboard?.revision !== revision) {
        const sharedSignal = new AbortController().signal;
        const request: Promise<DashboardData[]> = Promise.all([
            employeeApi.listRecords(sharedSignal),
            machineApi.list(allRecords, sharedSignal),
            monitorApi.list(allRecords, sharedSignal),
            phoneApi.list(allRecords, sharedSignal),
            printerApi.list(allRecords, sharedSignal),
            organizationApi.list(sharedSignal),
            apiRequest<Page<RecentChange>>(
                '/changes?direction=DESC&page_size=10',
                {signal: sharedSignal},
            ).then(({content}) => content),
        ]).then(
            ([
                employees,
                machines,
                monitors,
                phones,
                printers,
                organizations,
                changes,
            ]) => [
                {
                    employees,
                    machines,
                    monitors,
                    phones,
                    printers,
                    ...organizations,
                    changes,
                },
            ],
        );
        pendingDashboard = {revision, request};
        const clearPending = (): void => {
            if (pendingDashboard?.request === request) {
                pendingDashboard = undefined;
            }
        };

        void request.then(clearPending).catch(clearPending);
    }

    const {request} = pendingDashboard;
    return new Promise<DashboardData[]>((resolve, reject) => {
        const onAbort = (): void => {
            reject(new DOMException('The request was aborted.', 'AbortError'));
        };

        signal.addEventListener('abort', onAbort, {once: true});
        if (signal.aborted) {
            onAbort();
        }

        void request
            .then((snapshots) => {
                signal.removeEventListener('abort', onAbort);
                resolve(snapshots);
            })
            .catch((error: unknown) => {
                signal.removeEventListener('abort', onAbort);
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            });
    });
}

export function useDashboard() {
    const {t} = useTranslation();
    const {data, ...query} = useResourceQuery(
        'all',
        loadDashboard,
        'Unable to load the dashboard.',
    );
    const snapshot = data[0];
    const summary = useMemo(
        () =>
            snapshot === undefined
                ? undefined
                : summarizeDashboard(snapshot, t),
        [snapshot, t],
    );
    return {...query, summary, changes: snapshot?.changes ?? []};
}
