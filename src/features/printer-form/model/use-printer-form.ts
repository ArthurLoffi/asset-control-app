import {useRef, useState, type SubmitEvent} from 'react';
import {
    organizationOptions,
    parsePrinterForm,
    type PrinterFormValues,
} from './printer-form';
import {printerApi, useOrganizations, type Printer} from '@/entities';

export type PrinterFormProps = {
    printer?: Printer;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function usePrinterForm({printer, onSaved}: PrinterFormProps) {
    const [saving, setSaving] = useState(false);
    const pending = useRef(false);
    const [error, setError] = useState('');
    const organizations = useOrganizations();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending.current) {
            return;
        }

        const data = new FormData(event.currentTarget);
        const getText = (name: keyof PrinterFormValues) => {
            const value = data.get(name);
            return typeof value === 'string' ? value : '';
        };

        const result = parsePrinterForm({
            asset_number: getText('asset_number'),
            model: getText('model'),
            ip: getText('ip'),
            machine_condition: getText('machine_condition'),
            branch_id: getText('branch_id'),
            departments_id: getText('departments_id'),
        });
        if (result.error !== undefined) {
            setError(result.error);
            return;
        }

        pending.current = true;
        setSaving(true);
        setError('');
        try {
            if (printer) {
                await printerApi.update(printer.id, result.input);
            } else {
                await printerApi.create(result.input);
            }

            onSaved(
                printer
                    ? 'Printer updated successfully.'
                    : 'Printer created successfully.',
            );
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Unable to save printer.',
            );
        } finally {
            pending.current = false;
            setSaving(false);
        }
    }

    return {
        saving,
        error,
        handleSubmit,
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
