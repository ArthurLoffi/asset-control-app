import {
    phoneSituations,
    phoneEquipmentOptions,
    type PhoneInput,
    type Phone,
    type PhoneSituation,
} from '@/entities';
import {parseEmployeeIds} from '@/shared';

export type PhoneFormValues = Record<
    | 'equipament'
    | 'employee_id'
    | 'has_chip'
    | 'imei'
    | 'model'
    | 'serial_number'
    | 'situation',
    string
> & {employee_ids?: string};

type PhoneFormResult =
    {input: PhoneInput; error?: never} | {input?: never; error: string};

export function requiresPhoneIdentification(
    equipment: Phone['equipament'],
): boolean {
    return equipment !== 'Só chip' && equipment !== 'Sem chip';
}

export function parsePhoneForm(values: PhoneFormValues): PhoneFormResult {
    const model = values.model.trim();
    const imei = values.imei.trim();
    const serialNumber = values.serial_number.trim();
    if (
        (requiresPhoneIdentification(values.equipament) &&
            (model.length === 0 ||
                imei.length === 0 ||
                serialNumber.length === 0)) ||
        values.situation.length === 0
    ) {
        return {error: 'Complete all required phone fields.'};
    }

    const employeeIds =
        values.employee_ids === undefined
            ? undefined
            : parseEmployeeIds(values.employee_ids);
    const employeeId =
        values.employee_ids === undefined
            ? values.employee_id.length === 0
                ? null
                : Number(values.employee_id)
            : (employeeIds?.[0] ?? null);
    if (
        (employeeIds === undefined && values.employee_ids !== undefined) ||
        (employeeId !== null &&
            (!Number.isSafeInteger(employeeId) || employeeId <= 0)) ||
        (values.equipament.length > 0 &&
            phoneEquipmentOptions.every(
                ({value}) => value !== values.equipament,
            )) ||
        (values.equipament === 'Só chip' && values.has_chip === 'false') ||
        (values.equipament === 'Sem chip' && values.has_chip === 'true') ||
        !['', 'true', 'false'].includes(values.has_chip) ||
        !phoneSituations.includes(values.situation as PhoneSituation)
    ) {
        return {error: 'Select valid phone details.'};
    }

    return {
        input: {
            // Preserve the field spelling used by the phone API.
            equipament:
                values.equipament.length === 0 ? null : values.equipament,
            model,
            imei,
            serial_number: serialNumber,
            has_chip:
                values.has_chip.length === 0
                    ? null
                    : values.has_chip === 'true',
            situation: values.situation as PhoneSituation,
            employee_id: employeeId,
            ...(employeeIds && {employee_ids: employeeIds}),
        },
    };
}
