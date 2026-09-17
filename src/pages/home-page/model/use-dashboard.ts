import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {summarizeDashboard, type DashboardSnapshot} from './dashboard';
import {
    employeeApi,
    machineApi,
    monitorApi,
    phoneApi,
    printerApi,
    organizationApi,
} from '@/entities';
import {useResourceQuery} from '@/shared';

const allRecords = {kind: 'all'} as const;

export async function loadDashboard(
    _search: 'all',
    signal: AbortSignal,
): Promise<DashboardSnapshot[]> {
    const [employees, machines, monitors, phones, printers, organizations] =
        await Promise.all([
            employeeApi.listRecords(signal),
            machineApi.list(allRecords, signal),
            monitorApi.list(allRecords, signal),
            phoneApi.list(allRecords, signal),
            printerApi.list(allRecords, signal),
            organizationApi.list(signal),
        ]);
    return [
        {employees, machines, monitors, phones, printers, ...organizations},
    ];
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
    return {...query, summary};
}
