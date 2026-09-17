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
import {
    parsePhoneForm,
    requiresPhoneIdentification,
    type PhoneFormValues,
} from '../model/phone-form';
import {
    translateMessage,
    DeactivationFields,
    translateInventoryValue,
    useRecordDeactivation,
} from '@/shared';
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

function booleanDefault(value: Phone['has_chip'] | undefined) {
    return value === null || value === undefined ? null : String(value);
}

export function PhoneForm({
    phone,
    onClose,
    onSaved,
}: PhoneFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('phone').toLowerCase();
    const resourceLabel = 'Phone';
    const booleanOptions = [
        {value: 'true', label: t('common.values.yes')},
        {value: 'false', label: t('common.values.no')},
    ];
    const translateValue = (value: string): string =>
        translateInventoryValue(value, t) ?? value;
    const [formSaving, setSaving] = useState(false);
    const [formError, setError] = useState('');
    const [hasChip, setHasChip] = useState(booleanDefault(phone?.has_chip));
    const [equipment, setEquipment] = useState(phone?.equipament ?? null);
    const requiresIdentification = requiresPhoneIdentification(equipment);

    const deactivation = useRecordDeactivation({
        id: phone?.id,
        deactivate: phoneApi.deactivate,
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
                    ? `${resourceLabel} updated successfully.`
                    : `${resourceLabel} created successfully.`,
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
            title={t(phone ? 'forms.edit' : 'forms.new', {
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
                            details: t('phoneDetails'),
                        })}
                    </Text>
                    {!requiresIdentification && (
                        <Text size="sm" c="dimmed">
                            {t('forms.phoneOptional')}
                        </Text>
                    )}
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
                        editing={phone !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <TextInput
                                autoFocus
                                label={t('common.fields.employeeId')}
                                name="employee_id"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={phone?.employee_id ?? ''}
                                placeholder={t('common.labels.optional')}
                            />
                            <TextInput
                                required={requiresIdentification}
                                label={t('common.fields.model')}
                                name="model"
                                defaultValue={phone?.model}
                                placeholder={t('forms.galaxy')}
                            />
                            <Select
                                clearable
                                label={t('companyEquipment')}
                                name="equipament"
                                data={phoneEquipmentOptions.map(({value}) => ({
                                    value,
                                    label: translateValue(value),
                                }))}
                                value={equipment}
                                placeholder={t('common.labels.notSpecified')}
                                onChange={(value) => {
                                    setEquipment(value);
                                    if (value === 'Só chip') {
                                        setHasChip('true');
                                    } else if (value === 'Sem chip') {
                                        setHasChip('false');
                                    }
                                }}
                            />
                            <TextInput
                                required={requiresIdentification}
                                label="IMEI"
                                name="imei"
                                defaultValue={phone?.imei}
                                placeholder={t('forms.deviceImei')}
                            />
                            <TextInput
                                required={requiresIdentification}
                                label={t('common.fields.serialNumber')}
                                name="serial_number"
                                defaultValue={phone?.serial_number ?? ''}
                                placeholder={t('forms.manufacturerSerial')}
                            />
                            <Select
                                required
                                allowDeselect={false}
                                label={t('common.fields.situation')}
                                name="situation"
                                data={phoneSituations.map((value) => ({
                                    value,
                                    label: translateValue(value),
                                }))}
                                defaultValue={phone?.situation ?? 'Em uso'}
                            />
                            <Select
                                clearable
                                label={t('simIncluded')}
                                name="has_chip"
                                data={booleanOptions}
                                value={hasChip}
                                onChange={setHasChip}
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
                                : phone
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
