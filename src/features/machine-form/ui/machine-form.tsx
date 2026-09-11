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
    parseMachineForm,
    type MachineFormValues,
} from '../model/machine-form.js';
import {
    machineApi,
    machineConditions,
    machineSituations,
    machineTypes,
    type Machine,
} from '@/entities/machine/index.js';

type MachineFormProps = {
    machine?: Machine;
    onClose: () => void;
    onSaved: (message: string) => void;
};

const booleanOptions = [
    {value: 'true', label: 'Yes'},
    {value: 'false', label: 'No'},
];

function booleanDefault(value: Machine['has_keyboard'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

function MachineFields({machine}: {machine?: Machine}) {
    return (
        <SimpleGrid cols={{base: 1, sm: 2}}>
            <TextInput
                autoFocus
                required
                label="User"
                name="user"
                defaultValue={machine?.user}
                placeholder="e.g. alex.morgan"
            />
            <TextInput
                label="Employee ID"
                name="employee_id"
                type="number"
                min={1}
                step={1}
                defaultValue={machine?.employee_id ?? ''}
                placeholder="Optional"
            />
            <Select
                required
                allowDeselect={false}
                label="Type"
                name="type"
                data={[...machineTypes]}
                defaultValue={machine?.type ?? null}
                placeholder="Select a type"
            />
            <TextInput
                required
                label="Model"
                name="model"
                defaultValue={machine?.model}
                placeholder="e.g. Latitude 5450"
            />
            <TextInput
                required
                label="Serial number"
                name="serial_number"
                defaultValue={machine?.serial_number}
                placeholder="Manufacturer serial number"
            />
            <TextInput
                label="Asset number"
                name="asset_number"
                type="number"
                min={1}
                step={1}
                defaultValue={machine?.asset_number ?? ''}
                placeholder="Optional"
            />
            <Select
                clearable
                label="Condition"
                name="machine_condition"
                data={[...machineConditions]}
                defaultValue={machine?.machine_condition ?? null}
                placeholder="Not specified"
            />
            <Select
                required
                allowDeselect={false}
                label="Situation"
                name="situation"
                data={[...machineSituations]}
                defaultValue={machine?.situation ?? 'Em uso'}
            />
            <Select
                clearable
                label="Keyboard included"
                name="has_keyboard"
                data={booleanOptions}
                defaultValue={booleanDefault(machine?.has_keyboard)}
                placeholder="Not specified"
            />
            <Select
                clearable
                label="Mouse included"
                name="has_mouse"
                data={booleanOptions}
                defaultValue={booleanDefault(machine?.has_mouse)}
                placeholder="Not specified"
            />
        </SimpleGrid>
    );
}

export function MachineForm({machine, onClose, onSaved}: MachineFormProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) {
            return;
        }

        const data = new FormData(event.currentTarget);
        const getText = (name: keyof MachineFormValues) => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };

        const result = parseMachineForm({
            user: getText('user'),
            asset_number: getText('asset_number'),
            type: getText('type'),
            model: getText('model'),
            serial_number: getText('serial_number'),
            has_keyboard: getText('has_keyboard'),
            has_mouse: getText('has_mouse'),
            machine_condition: getText('machine_condition'),
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
            if (machine) {
                await machineApi.update(machine.id, result.input);
            } else {
                await machineApi.create(result.input);
            }

            onSaved(
                machine
                    ? 'Machine updated successfully.'
                    : 'Machine created successfully.',
            );
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Unable to save machine.',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            opened
            centered
            title={machine ? 'Edit machine' : 'New machine'}
            onClose={onClose}
            closeOnClickOutside={!saving}
            closeOnEscape={!saving}
            withCloseButton={!saving}
            size="xl"
        >
            <form
                onSubmit={(event) => {
                    void handleSubmit(event);
                }}
            >
                <Stack>
                    <Text size="sm" c="dimmed">
                        Keep identification, assignment, and equipment status up
                        to date.
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save machine"
                            role="alert"
                        >
                            {error}
                        </Alert>
                    )}
                    <fieldset
                        disabled={saving}
                        style={{border: 0, padding: 0, margin: 0, minWidth: 0}}
                    >
                        <MachineFields machine={machine} />
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
                            {machine ? 'Save changes' : 'Create machine'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
