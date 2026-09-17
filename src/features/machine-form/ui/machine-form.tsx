import {useState, type ReactElement, type SubmitEvent} from 'react';
import {useTranslation} from 'react-i18next';
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
import {parseMachineForm, type MachineFormValues} from '../model/machine-form';
import {
    translateMessage,
    DeactivationFields,
    translateInventoryValue,
    useRecordDeactivation,
} from '@/shared';
import {
    machineApi,
    machineConditions,
    machineSituations,
    machineTypes,
    type Machine,
} from '@/entities';

type MachineFormProps = {
    machine?: Machine;
    onClose: () => void;
    onSaved: (message: string) => void;
};

function booleanDefault(value: Machine['has_keyboard'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

function MachineFields({machine}: {machine?: Machine}): ReactElement {
    const {t} = useTranslation();
    const booleanOptions = [
        {value: 'true', label: t('common.values.yes')},
        {value: 'false', label: t('common.values.no')},
    ];
    const translateValue = (value: string): string =>
        translateInventoryValue(value, t) ?? value;
    return (
        <SimpleGrid cols={{base: 1, sm: 2}}>
            <TextInput
                autoFocus
                required
                label={t('common.fields.user')}
                name="user"
                defaultValue={machine?.user}
                placeholder={t('forms.alexUser')}
            />
            <TextInput
                label={t('common.fields.employeeId')}
                name="employee_id"
                type="number"
                min={1}
                step={1}
                defaultValue={machine?.employee_id ?? ''}
                placeholder={t('common.labels.optional')}
            />
            <Select
                required
                allowDeselect={false}
                label={t('type')}
                name="type"
                data={machineTypes.map((value) => ({
                    value,
                    label: translateValue(value),
                }))}
                defaultValue={machine?.type ?? null}
                placeholder={t('forms.selectType')}
            />
            <TextInput
                required
                label={t('common.fields.model')}
                name="model"
                defaultValue={machine?.model}
                placeholder={t('forms.latitude')}
            />
            <TextInput
                label={t('common.fields.serialNumber')}
                name="serial_number"
                defaultValue={machine?.serial_number ?? ''}
                placeholder={t('forms.manufacturerSerial')}
            />
            <TextInput
                label={t('common.fields.assetNumber')}
                name="asset_number"
                type="number"
                min={1}
                step={1}
                defaultValue={machine?.asset_number ?? ''}
                placeholder={t('common.labels.optional')}
            />
            <Select
                clearable
                label={t('common.fields.condition')}
                name="machine_condition"
                data={machineConditions.map((value) => ({
                    value,
                    label: translateValue(value),
                }))}
                defaultValue={machine?.machine_condition ?? null}
                placeholder={t('common.labels.notSpecified')}
            />
            <Select
                required
                allowDeselect={false}
                label={t('common.fields.situation')}
                name="situation"
                data={machineSituations.map((value) => ({
                    value,
                    label: translateValue(value),
                }))}
                defaultValue={machine?.situation ?? 'Em uso'}
            />
            <Select
                clearable
                label={t('keyboardIncluded')}
                name="has_keyboard"
                data={booleanOptions}
                defaultValue={booleanDefault(machine?.has_keyboard)}
                placeholder={t('common.labels.notSpecified')}
            />
            <Select
                clearable
                label={t('mouseIncluded')}
                name="has_mouse"
                data={booleanOptions}
                defaultValue={booleanDefault(machine?.has_mouse)}
                placeholder={t('common.labels.notSpecified')}
            />
        </SimpleGrid>
    );
}

export function MachineForm({
    machine,
    onClose,
    onSaved,
}: MachineFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('machine').toLowerCase();
    const resourceLabel = 'Machine';
    const [formSaving, setSaving] = useState(false);
    const [formError, setError] = useState('');

    const deactivation = useRecordDeactivation({
        id: machine?.id,
        deactivate: machineApi.deactivate,
        onDeactivated() {
            onSaved(`${resourceLabel} deactivated successfully.`);
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
                    ? `${resourceLabel} updated successfully.`
                    : `${resourceLabel} created successfully.`,
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
            title={t(machine ? 'forms.edit' : 'forms.new', {
                resource,
            })}
            onClose={onClose}
            closeOnClickOutside={!isSaving}
            closeOnEscape={!isSaving}
            withCloseButton={!isSaving}
            size="xl"
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
                        {t('forms.keepDetails', {
                            details: t('machineDetails'),
                        })}
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title={t('forms.couldNotSave', {
                                resource,
                            })}
                            role="alert"
                        >
                            {translateMessage(error, t)}
                        </Alert>
                    )}
                    <DeactivationFields
                        editing={machine !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <MachineFields machine={machine} />
                    </DeactivationFields>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={isSaving}
                            onClick={onClose}
                        >
                            {t('common.actions.cancel')}
                        </Button>
                        <Button type="submit" loading={isSaving}>
                            {deactivation.selected
                                ? t('deactivate', {resource})
                                : machine
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
