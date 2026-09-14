import {
    printerConditions,
    type PrinterCondition,
    type PrinterInput,
    type OrganizationOption,
} from '@/entities';

export type PrinterFormValues = Record<keyof PrinterInput, string>;
type PrinterFormResult =
    {input: PrinterInput; error?: never} | {input?: never; error: string};

function isIpAddress(value: string) {
    if (!value.includes(':')) {
        const octets = value.split('.');
        return (
            octets.length === 4 &&
            octets.every(
                (octet) =>
                    /^(?:0|[1-9]\d{0,2})$/u.test(octet) && Number(octet) <= 255,
            )
        );
    }

    // The browser URL parser validates compressed and IPv4-mapped IPv6 literals.
    if (!/^[\d.:a-f]+$/iu.test(value)) {
        return false;
    }

    try {
        return new URL(`http://[${value}]/`).hostname.length > 0;
    } catch {
        return false;
    }
}

export function organizationOptions(
    items: OrganizationOption[],
    currentId?: number,
) {
    const options = items.map(({id, name}) => ({
        value: String(id),
        label: name,
    }));
    if (currentId !== undefined && items.every(({id}) => id !== currentId)) {
        options.push({
            value: String(currentId),
            label: `ID #${currentId} (unavailable)`,
        });
    }

    return options;
}

export function parsePrinterForm(values: PrinterFormValues): PrinterFormResult {
    const assetNumber = Number(values.asset_number);
    const branchId = Number(values.branch_id);
    const departmentsId = Number(values.departments_id);
    if (
        [assetNumber, branchId, departmentsId].some(
            (value) => !Number.isSafeInteger(value) || value <= 0,
        )
    ) {
        return {
            error: 'Enter a positive asset number and select a branch and department.',
        };
    }

    const model = values.model.trim();
    if (model.length === 0 || [...model].length > 100) {
        return {error: 'Enter a model with 1 to 100 characters.'};
    }

    const ip = values.ip.trim();
    if (!isIpAddress(ip)) {
        return {error: 'Enter a valid IPv4 or IPv6 address.'};
    }

    const condition = values.machine_condition.trim();
    if (
        condition.length > 0 &&
        !printerConditions.includes(condition as PrinterCondition)
    ) {
        return {error: 'Select a valid printer condition.'};
    }

    return {
        input: {
            asset_number: assetNumber,
            model,
            ip,
            machine_condition:
                condition.length > 0 ? (condition as PrinterCondition) : null,
            branch_id: branchId,
            departments_id: departmentsId,
        },
    };
}
