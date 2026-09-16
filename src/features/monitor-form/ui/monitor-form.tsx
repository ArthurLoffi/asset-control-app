import {useState, type ReactElement, type SubmitEvent} from 'react';
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
import {parseMonitorForm, type MonitorFormValues} from '../model/monitor-form';
import {
    monitorApi,
    monitorConditions,
    monitorSituations,
    type Monitor,
} from '@/entities';
import {DeactivationFields, useRecordDeactivation} from '@/shared';

type MonitorFormProps = {
    monitor?: Monitor;
    onClose: () => void;
    onSaved: (message: string) => void;
};

const booleanOptions = [
    {value: 'true', label: 'Yes'},
    {value: 'false', label: 'No'},
];

function booleanDefault(value: Monitor['has_monitor'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

export function MonitorForm({
    monitor,
    onClose,
    onSaved,
}: MonitorFormProps): ReactElement {
    const [formSaving, setSaving] = useState(false);
    const [formError, setError] = useState('');

    const deactivation = useRecordDeactivation({
        id: monitor?.id,
        deactivate: monitorApi.deactivate,
        onDeactivated() {
            onSaved('Monitor deactivated successfully.');
        },
    });
    const isSaving = formSaving || deactivation.saving;
    const error =
        deactivation.error.length > 0 ? deactivation.error : formError;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSaving) {
            return;
        }

        const data = new FormData(event.currentTarget);
        const getText = (name: keyof MonitorFormValues) => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };

        const result = parseMonitorForm({
            has_monitor: getText('has_monitor'),
            asset_number: getText('asset_number'),
            brand: getText('brand'),
            model: getText('model'),
            serial_number: getText('serial_number'),
            monitor_condition: getText('monitor_condition'),
            situation: getText('situation'),
            employee_id: getText('employee_id'),
        });

        if (result.error !== undefined) {
            setError(result.error);
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (monitor) {
                await monitorApi.update(monitor.id, result.input);
            } else {
                await monitorApi.create(result.input);
            }

            onSaved(
                monitor
                    ? 'Monitor updated successfully.'
                    : 'Monitor created successfully.',
            );
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Unable to save monitor.',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            opened
            centered
            size="xl"
            title={monitor ? 'Edit monitor' : 'New monitor'}
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
                        Keep identification, assignment, and monitor status up
                        to date.
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save monitor"
                            role="alert"
                        >
                            {error}
                        </Alert>
                    )}
                    <DeactivationFields
                        editing={monitor !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <TextInput
                                autoFocus
                                label="Employee ID"
                                name="employee_id"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={monitor?.employee_id ?? ''}
                                placeholder="Optional"
                            />
                            <TextInput
                                required
                                label="Model"
                                name="model"
                                defaultValue={monitor?.model}
                                placeholder="e.g. P2422H"
                            />
                            <TextInput
                                label="Brand"
                                name="brand"
                                defaultValue={monitor?.brand ?? ''}
                                placeholder="e.g. Dell"
                            />
                            <TextInput
                                label="Serial number"
                                name="serial_number"
                                defaultValue={monitor?.serial_number ?? ''}
                                placeholder="Manufacturer serial number"
                            />
                            <TextInput
                                label="Asset number"
                                name="asset_number"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={monitor?.asset_number ?? ''}
                                placeholder="Optional"
                            />
                            <Select
                                clearable
                                label="Condition"
                                name="monitor_condition"
                                data={[...monitorConditions]}
                                defaultValue={
                                    monitor?.monitor_condition ?? null
                                }
                                placeholder="Not specified"
                            />
                            <Select
                                required
                                allowDeselect={false}
                                label="Situation"
                                name="situation"
                                data={[...monitorSituations]}
                                defaultValue={monitor?.situation ?? 'Em uso'}
                            />
                            <Select
                                clearable
                                label="Monitor provided"
                                name="has_monitor"
                                data={booleanOptions}
                                defaultValue={booleanDefault(
                                    monitor?.has_monitor,
                                )}
                                placeholder="Not specified"
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
                        <Button type="submit" loading={isSaving}>
                            {deactivation.selected
                                ? 'Deactivate monitor'
                                : monitor
                                  ? 'Save changes'
                                  : 'Create monitor'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
