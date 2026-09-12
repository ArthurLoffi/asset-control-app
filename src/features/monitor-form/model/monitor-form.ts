import {
    monitorConditions,
    monitorSituations,
    type MonitorCondition,
    type MonitorInput,
    type MonitorSituation,
} from '@/entities';

export type MonitorFormValues = Record<
    | 'asset_number'
    | 'brand'
    | 'employee_id'
    | 'has_monitor'
    | 'model'
    | 'monitor_condition'
    | 'serial_number'
    | 'situation',
    string
>;

type MonitorFormResult =
    {input: MonitorInput; error?: never} | {input?: never; error: string};

function optionalPositiveInteger(value: string) {
    if (value.length === 0) {
        return null;
    }

    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

function optionalText(value: string) {
    return value.length === 0 ? null : value;
}

export function parseMonitorForm(values: MonitorFormValues): MonitorFormResult {
    const assetNumber = optionalPositiveInteger(values.asset_number);
    const employeeId = optionalPositiveInteger(values.employee_id);
    if (values.model.length === 0 || values.situation.length === 0) {
        return {error: 'Complete all required monitor fields.'};
    }

    if (assetNumber === undefined || employeeId === undefined) {
        return {error: 'Select valid monitor details.'};
    }

    if (
        !['', 'true', 'false'].includes(values.has_monitor) ||
        !monitorSituations.includes(values.situation as MonitorSituation) ||
        (values.monitor_condition.length > 0 &&
            !monitorConditions.includes(
                values.monitor_condition as MonitorCondition,
            ))
    ) {
        return {error: 'Select valid monitor details.'};
    }

    return {
        input: {
            has_monitor:
                values.has_monitor.length === 0
                    ? null
                    : values.has_monitor === 'true',
            asset_number: assetNumber,
            brand: optionalText(values.brand),
            model: values.model,
            serial_number: optionalText(values.serial_number),
            monitor_condition:
                values.monitor_condition.length === 0
                    ? null
                    : (values.monitor_condition as MonitorCondition),
            situation: values.situation as MonitorSituation,
            employee_id: employeeId,
        },
    };
}
