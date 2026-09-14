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
import {parsePhoneForm, type PhoneFormValues} from '../model/phone-form';
import {
    phoneApi,
    phoneSituations,
    phoneEquipmentOptions,
    type Phone,
} from '@/entities';

type PhoneFormProps = {
    phone?: Phone;
    onClose: () => void;
    onSaved: (message: string) => void;
};

const booleanOptions = [
    {value: 'true', label: 'Yes'},
    {value: 'false', label: 'No'},
];

function booleanDefault(value: Phone['has_chip'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

export function PhoneForm({phone, onClose, onSaved}: PhoneFormProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [hasChip, setHasChip] = useState(booleanDefault(phone?.has_chip));

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) {
            return;
        }

        const data = new FormData(event.currentTarget);
        const getText = (name: keyof PhoneFormValues) => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };

        const result = parsePhoneForm({
            has_chip: getText('has_chip'),
            equipament: getText('equipament'),
            imei: getText('imei'),
            model: getText('model'),
            serial_number: getText('serial_number'),
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
            if (phone) {
                await phoneApi.update(phone.id, result.input);
            } else {
                await phoneApi.create(result.input);
            }

            onSaved(
                phone
                    ? 'Phone updated successfully.'
                    : 'Phone created successfully.',
            );
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Unable to save phone.',
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
            title={phone ? 'Edit phone' : 'New phone'}
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
                        Keep identification, assignment, and phone status up to
                        date.
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save phone"
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
                                defaultValue={phone?.employee_id ?? ''}
                                placeholder="Optional"
                            />
                            <TextInput
                                required
                                label="Model"
                                name="model"
                                defaultValue={phone?.model}
                                placeholder="e.g. Galaxy A55"
                            />
                            <Select
                                clearable
                                label="Company equipment"
                                name="equipament"
                                data={phoneEquipmentOptions.map(
                                    ({value, label}) => ({value, label}),
                                )}
                                defaultValue={phone?.equipament ?? null}
                                placeholder="Not specified"
                                onChange={(value) => {
                                    if (value === 'Só chip') {
                                        setHasChip('true');
                                    } else if (value === 'Sem chip') {
                                        setHasChip('false');
                                    }
                                }}
                            />
                            <TextInput
                                required
                                label="IMEI"
                                name="imei"
                                defaultValue={phone?.imei}
                                placeholder="Device IMEI"
                            />
                            <TextInput
                                required
                                label="Serial number"
                                name="serial_number"
                                defaultValue={phone?.serial_number ?? ''}
                                placeholder="Manufacturer serial number"
                            />
                            <Select
                                required
                                allowDeselect={false}
                                label="Situation"
                                name="situation"
                                data={[...phoneSituations]}
                                defaultValue={phone?.situation ?? 'Em uso'}
                            />
                            <Select
                                clearable
                                label="SIM card included"
                                name="has_chip"
                                data={booleanOptions}
                                value={hasChip}
                                onChange={setHasChip}
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
                            {phone ? 'Save changes' : 'Create phone'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
