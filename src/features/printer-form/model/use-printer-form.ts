import {organizationOptions, parsePrinterForm} from './printer-form';
import {printerApi, useOrganizations, type Printer} from '@/entities';
import {formText, useResourceForm} from '@/shared';

export type PrinterFormProps = {
    printer?: Printer;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function usePrinterForm({printer, onSaved}: PrinterFormProps) {
    const organizations = useOrganizations();
    const state = useResourceForm({
        id: printer?.id,
        api: printerApi,
        parse: (data) =>
            parsePrinterForm({
                asset_number: formText(data, 'asset_number'),
                model: formText(data, 'model'),
                ip: formText(data, 'ip'),
                machine_condition: formText(data, 'machine_condition'),
                branch_id: formText(data, 'branch_id'),
                departments_id: formText(data, 'departments_id'),
            }),
        onSaved() {
            onSaved(
                printer
                    ? 'Printer updated successfully.'
                    : 'Printer created successfully.',
            );
        },
        fallbackError: 'Unable to save printer.',
    });
    return {
        ...state,
        organizationError: organizations.error,
        loadingOrganizations: organizations.loading,
        branches: organizationOptions(
            organizations.branches,
            printer?.branch_id,
        ),
        departments: organizationOptions(
            organizations.departments,
            printer?.departments_id,
        ),
    };
}
