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
import {printerConditions} from '@/entities';

export function PrinterForm(props: PrinterFormProps): ReactElement {
    const {printer, onClose} = props;
    const {
        saving,
        error,
        handleSubmit,
        organizationError,
        loadingOrganizations,
        branches,
        departments,
    } = usePrinterForm(props);

    return (
        <Modal
            opened
            centered
            size="lg"
            title={printer ? 'Edit printer' : 'New printer'}
            onClose={onClose}
            closeOnClickOutside={!saving}
            closeOnEscape={!saving}
            withCloseButton={!saving}
        >
            <form
                onSubmit={(event) => {
                    void handleSubmit(event);
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
                    <fieldset
                        disabled={saving}
                        style={{border: 0, padding: 0, margin: 0, minWidth: 0}}
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
                                disabled={loadingOrganizations}
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
                                disabled={loadingOrganizations}
                                placeholder={
                                    loadingOrganizations
                                        ? 'Loading departments…'
                                        : 'Select a department'
                                }
                                nothingFoundMessage="No departments found"
                            />
                        </SimpleGrid>
                    </fieldset>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={saving}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={saving}
                            disabled={loadingOrganizations}
                        >
                            {printer ? 'Save changes' : 'Create printer'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
