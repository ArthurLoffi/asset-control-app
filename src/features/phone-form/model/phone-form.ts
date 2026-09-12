import {
    phoneSituations,
    phoneEquipmentOptions,
    type PhoneInput,
    type PhoneSituation,
} from '@/entities';

export type PhoneFormValues = Record<
    | 'equipament'
    | 'employee_id'
    | 'has_chip'
    | 'imei'
    | 'model'
    | 'serial_number'
    | 'situation',
    string
>;

type PhoneFormResult =
    {input: PhoneInput; error?: never} | {input?: never; error: string};

export function parsePhoneForm(values: PhoneFormValues): PhoneFormResult {
    if (
        values.model.length === 0 ||
        values.imei.length === 0 ||
        values.serial_number.length === 0 ||
        values.situation.length === 0
    ) {
        return {error: 'Complete all required phone fields.'};
    }

    const employeeId =
        values.employee_id.length === 0 ? null : Number(values.employee_id);
    if (
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
            model: values.model,
            imei: values.imei,
            serial_number: values.serial_number,
            has_chip:
                values.has_chip.length === 0
                    ? null
                    : values.has_chip === 'true',
            situation: values.situation as PhoneSituation,
            employee_id: employeeId,
        },
    };
}
