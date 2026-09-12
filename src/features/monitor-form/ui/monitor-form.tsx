import {useState, type SubmitEvent} from 'react';
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
import {
    parseMonitorForm,
    type MonitorFormValues,
} from '../model/monitor-form.js';
import {
    monitorApi,
    monitorConditions,
    monitorSituations,
    type Monitor,
} from '@/entities';

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

export function MonitorForm({monitor, onClose, onSaved}: MonitorFormProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) {
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
                    <fieldset
                        disabled={saving}
                        style={{border: 0, padding: 0, margin: 0, minWidth: 0}}
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
                    </fieldset>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={saving}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {monitor ? 'Save changes' : 'Create monitor'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
