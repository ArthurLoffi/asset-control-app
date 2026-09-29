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
    Textarea,
} from '@mantine/core';
import {parseMonitorForm, type MonitorFormValues} from '../model/monitor-form';
import {
    translateMessage,
    DeactivationFields,
    translateInventoryValue,
    useRecordDeactivation,
    effectiveValues,
} from '@/shared';
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

function booleanDefault(value: Monitor['has_monitor'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

export function MonitorForm({
    monitor,
    onClose,
    onSaved,
}: MonitorFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('monitor').toLowerCase();
    const resourceLabel = 'Monitor';
    const booleanOptions = [
        {value: 'true', label: t('common.values.yes')},
        {value: 'false', label: t('common.values.no')},
    ];
    const translateValue = (value: string): string =>
        translateInventoryValue(value, t) ?? value;
    const [formSaving, setSaving] = useState(false);
    const [formError, setError] = useState('');

    const deactivation = useRecordDeactivation({
        id: monitor?.id,
        deactivate: monitorApi.deactivate,
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
            employee_ids: getText('employee_ids'),
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
                    ? `${resourceLabel} updated successfully.`
                    : `${resourceLabel} created successfully.`,
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
            title={t(monitor ? 'forms.edit' : 'forms.new', {
                resource,
            })}
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
                        {t('forms.keepDetails', {
                            details: t('monitorDetails'),
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
                        editing={monitor !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <Textarea
                                autoFocus
                                label={t('multiValues.employeeIds')}
                                description={t('multiValues.onePerLine')}
                                name="employee_ids"
                                defaultValue={
                                    monitor
                                        ? effectiveValues(
                                              monitor.employee_id,
                                              monitor.employee_ids,
                                          ).join('\n')
                                        : ''
                                }
                                placeholder={t('common.labels.optional')}
                            />
                            <TextInput
                                required
                                label={t('common.fields.model')}
                                name="model"
                                defaultValue={monitor?.model}
                                placeholder={t('forms.p2422h')}
                            />
                            <TextInput
                                label={t('common.fields.brand')}
                                name="brand"
                                defaultValue={monitor?.brand ?? ''}
                                placeholder={t('forms.dell')}
                            />
                            <TextInput
                                label={t('common.fields.serialNumber')}
                                name="serial_number"
                                defaultValue={monitor?.serial_number ?? ''}
                                placeholder={t('forms.manufacturerSerial')}
                            />
                            <TextInput
                                label={t('common.fields.assetNumber')}
                                name="asset_number"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={monitor?.asset_number ?? ''}
                                placeholder={t('common.labels.optional')}
                            />
                            <Select
                                clearable
                                label={t('common.fields.condition')}
                                name="monitor_condition"
                                data={monitorConditions.map((value) => ({
                                    value,
                                    label: translateValue(value),
                                }))}
                                defaultValue={
                                    monitor?.monitor_condition ?? null
                                }
                                placeholder={t('common.labels.notSpecified')}
                            />
                            <Select
                                required
                                allowDeselect={false}
                                label={t('common.fields.situation')}
                                name="situation"
                                data={monitorSituations.map((value) => ({
                                    value,
                                    label: translateValue(value),
                                }))}
                                defaultValue={monitor?.situation ?? 'Em uso'}
                            />
                            <Select
                                clearable
                                label={t('monitorProvided')}
                                name="has_monitor"
                                data={booleanOptions}
                                defaultValue={booleanDefault(
                                    monitor?.has_monitor,
                                )}
                                placeholder={t('common.labels.notSpecified')}
                            />
                        </SimpleGrid>
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
                                : monitor
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
