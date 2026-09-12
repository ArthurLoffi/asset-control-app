import {
    machineConditions,
    machineSituations,
    machineTypes,
    type MachineCondition,
    type MachineInput,
    type MachineSituation,
    type MachineType,
} from '@/entities';

export type MachineFormValues = Record<
    | 'asset_number'
    | 'employee_id'
    | 'has_keyboard'
    | 'has_mouse'
    | 'machine_condition'
    | 'model'
    | 'serial_number'
    | 'situation'
    | 'type'
    | 'user',
    string
>;

export type MachineFormResult =
    {input: MachineInput; error?: never} | {input?: never; error: string};

function optionalPositiveInteger(value: string) {
    if (value.length === 0) {
        return null;
    }

    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

function optionalBoolean(value: string) {
    if (value.length === 0) {
        return null;
    }

    return value === 'true';
}

export function parseMachineForm(values: MachineFormValues): MachineFormResult {
    const assetNumber = optionalPositiveInteger(values.asset_number);
    const employeeId = optionalPositiveInteger(values.employee_id);
    const requiredValues = [
        values.user,
        values.type,
        values.model,
        values.serial_number,
        values.situation,
    ];

    if (requiredValues.some((value) => value.length === 0)) {
        return {error: 'Complete all required machine fields.'};
    }

    if (assetNumber === undefined || employeeId === undefined) {
        return {
            error: 'Asset and employee IDs must be positive whole numbers.',
        };
    }

    const booleanValues = [values.has_keyboard, values.has_mouse];
    if (
        !machineTypes.includes(values.type as MachineType) ||
        !machineSituations.includes(values.situation as MachineSituation) ||
        booleanValues.some((value) => !['', 'true', 'false'].includes(value)) ||
        (values.machine_condition.length > 0 &&
            !machineConditions.includes(
                values.machine_condition as MachineCondition,
            ))
    ) {
        return {error: 'Select valid machine details.'};
    }

    return {
        input: {
            user: values.user,
            asset_number: assetNumber,
            type: values.type as MachineType,
            model: values.model,
            serial_number: values.serial_number,
            has_keyboard: optionalBoolean(values.has_keyboard),
            has_mouse: optionalBoolean(values.has_mouse),
            machine_condition:
                values.machine_condition.length === 0
                    ? null
                    : (values.machine_condition as MachineCondition),
            situation: values.situation as MachineSituation,
            employee_id: employeeId,
        },
    };
}
