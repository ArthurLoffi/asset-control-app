import {
    Alert,
    Button,
    Group,
    Modal,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import type {ReactElement} from 'react';
import {usePrinterForm, type PrinterFormProps} from '../model/use-printer-form';
import {printerApi, printerConditions} from '@/entities';
import {DeactivationFields, useRecordDeactivation} from '@/shared';

export function PrinterForm(props: PrinterFormProps): ReactElement {
    const {printer, onClose, onSaved} = props;
    const {
        saving: formSaving,
        error: formError,
        handleSubmit,
        organizationError,
        loadingOrganizations,
        branches,
        departments,
    } = usePrinterForm(props);

    const deactivation = useRecordDeactivation({
        id: printer?.id,
        deactivate: printerApi.deactivate,
        onDeactivated() {
            onSaved('Printer deactivated successfully.');
        },
    });
    const isSaving = formSaving || deactivation.saving;
    const error =
        deactivation.error.length > 0 ? deactivation.error : formError;

    return (
        <Modal
            opened
            centered
            size="lg"
            title={printer ? 'Edit printer' : 'New printer'}
            onClose={onClose}
            closeOnClickOutside={!isSaving}
            closeOnEscape={!isSaving}
            withCloseButton={!isSaving}
        >
            <form
                onSubmit={(event) => {
                    if (deactivation.selected) {
                        void deactivation.handleSubmit(event);
                    } else {
                        void handleSubmit(event);
                    }
                }}
            >
                <Stack>
                    <Text size="sm" c="dimmed">
                        Keep printer identification, network address, and
                        location up to date.
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save printer"
                            role="alert"
                        >
                            {error}
                        </Alert>
                    )}
                    {organizationError.length > 0 && (
                        <Alert
                            color="yellow"
                            title="Location options unavailable"
                            role="alert"
                        >
                            {organizationError} Close and reopen the form to
                            retry.
                        </Alert>
                    )}
                    <DeactivationFields
                        editing={printer !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <TextInput
                                autoFocus
                                required
                                label="Model"
                                name="model"
                                defaultValue={printer?.model}
                                placeholder="e.g. LaserJet Pro M404"
                            />
                            <TextInput
                                required
                                label="Asset number"
                                name="asset_number"
                                type="number"
                                min={1}
                                max={Number.MAX_SAFE_INTEGER}
                                step={1}
                                defaultValue={printer?.asset_number ?? ''}
                            />
                            <TextInput
                                required
                                label="IP address"
                                name="ip"
                                defaultValue={printer?.ip}
                                placeholder="e.g. 192.168.1.100 or 2001:db8::1"
                            />
                            <Select
                                clearable
                                label="Condition"
                                name="machine_condition"
                                data={[...printerConditions]}
                                defaultValue={
                                    printer?.machine_condition ?? null
                                }
                                placeholder="Not specified"
                            />
                            <Select
                                required
                                searchable
                                allowDeselect={false}
                                label="Branch"
                                name="branch_id"
                                data={branches}
                                defaultValue={
                                    printer ? String(printer.branch_id) : null
                                }
                                disabled={
                                    !deactivation.selected &&
                                    loadingOrganizations
                                }
                                placeholder={
                                    loadingOrganizations
                                        ? 'Loading branches…'
                                        : 'Select a branch'
                                }
                                nothingFoundMessage="No branches found"
                            />
                            <Select
                                required
                                searchable
                                allowDeselect={false}
                                label="Department"
                                name="departments_id"
                                data={departments}
                                defaultValue={
                                    printer
                                        ? String(printer.departments_id)
                                        : null
                                }
                                disabled={
                                    !deactivation.selected &&
                                    loadingOrganizations
                                }
                                placeholder={
                                    loadingOrganizations
                                        ? 'Loading departments…'
                                        : 'Select a department'
                                }
                                nothingFoundMessage="No departments found"
                            />
                        </SimpleGrid>
                    </DeactivationFields>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={isSaving}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={isSaving}
                            disabled={
                                !deactivation.selected && loadingOrganizations
                            }
                        >
                            {deactivation.selected
                                ? 'Deactivate printer'
                                : printer
                                  ? 'Save changes'
                                  : 'Create printer'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
