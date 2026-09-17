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
import {useTranslation} from 'react-i18next';
import {usePrinterForm, type PrinterFormProps} from '../model/use-printer-form';
import {
    translateMessage,
    DeactivationFields,
    translateInventoryValue,
    useRecordDeactivation,
} from '@/shared';
import {printerApi, printerConditions} from '@/entities';

export function PrinterForm(props: PrinterFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('printer').toLowerCase();
    const resourceLabel = 'Printer';
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
            onSaved(`${resourceLabel} deactivated successfully.`);
        },
    });
    const isSaving = formSaving || deactivation.saving;
    const translateValue = (value: string): string =>
        translateInventoryValue(value, t) ?? value;
    const error =
        deactivation.error.length > 0 ? deactivation.error : formError;

    return (
        <Modal
            opened
            centered
            size="lg"
            title={
                printer
                    ? t('forms.edit', {resource})
                    : t('resources.printers.new')
            }
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
                            details: t('printerDetails'),
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
                    {organizationError.length > 0 && (
                        <Alert
                            color="yellow"
                            title={t('forms.locationUnavailable')}
                            role="alert"
                        >
                            {t('forms.closeAndRetry', {
                                message: translateMessage(organizationError, t),
                            })}
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
                                label={t('common.fields.model')}
                                name="model"
                                defaultValue={printer?.model}
                                placeholder={t('forms.laserJet')}
                            />
                            <TextInput
                                required
                                label={t('common.fields.assetNumber')}
                                name="asset_number"
                                type="number"
                                min={1}
                                max={Number.MAX_SAFE_INTEGER}
                                step={1}
                                defaultValue={printer?.asset_number ?? ''}
                            />
                            <TextInput
                                required
                                label={t('common.fields.ipAddress')}
                                name="ip"
                                defaultValue={printer?.ip}
                                placeholder={t('forms.ipAddress')}
                            />
                            <Select
                                clearable
                                label={t('common.fields.condition')}
                                name="machine_condition"
                                data={printerConditions.map((value) => ({
                                    value,
                                    label: translateValue(value),
                                }))}
                                defaultValue={
                                    printer?.machine_condition ?? null
                                }
                                placeholder={t('common.labels.notSpecified')}
                            />
                            <Select
                                required
                                searchable
                                allowDeselect={false}
                                label={t('common.fields.branch')}
                                name="branch_id"
                                data={branches.map((option) => ({
                                    ...option,
                                    label:
                                        option.label ===
                                        `ID #${option.value} (unavailable)`
                                            ? t('common.labels.unavailableId', {
                                                  id: option.value,
                                              })
                                            : option.label,
                                }))}
                                defaultValue={
                                    printer ? String(printer.branch_id) : null
                                }
                                disabled={
                                    !deactivation.selected &&
                                    loadingOrganizations
                                }
                                placeholder={t(
                                    loadingOrganizations
                                        ? 'loadingBranches'
                                        : 'common.messages.selectBranch',
                                )}
                                nothingFoundMessage={t(
                                    'common.messages.noBranches',
                                )}
                            />
                            <Select
                                required
                                searchable
                                allowDeselect={false}
                                label={t('common.fields.department')}
                                name="departments_id"
                                data={departments.map((option) => ({
                                    ...option,
                                    label:
                                        option.label ===
                                        `ID #${option.value} (unavailable)`
                                            ? t('common.labels.unavailableId', {
                                                  id: option.value,
                                              })
                                            : option.label,
                                }))}
                                defaultValue={
                                    printer
                                        ? String(printer.departments_id)
                                        : null
                                }
                                disabled={
                                    !deactivation.selected &&
                                    loadingOrganizations
                                }
                                placeholder={t(
                                    loadingOrganizations
                                        ? 'loadingDepartments'
                                        : 'common.messages.selectDepartment',
                                )}
                                nothingFoundMessage={t(
                                    'common.messages.noDepartments',
                                )}
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
                        <Button
                            type="submit"
                            loading={isSaving}
                            disabled={
                                !deactivation.selected && loadingOrganizations
                            }
                        >
                            {deactivation.selected
                                ? t('deactivate', {resource})
                                : printer
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
