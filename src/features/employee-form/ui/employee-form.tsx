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
import {
    parseEmployeeForm,
    type EmployeeFormValues,
} from '../model/employee-form';
import {
    translateMessage,
    DeactivationFields,
    useRecordDeactivation,
    effectiveValues,
} from '@/shared';
import {employeeApi, type Employee, useOrganizations} from '@/entities';

type EmployeeFormProps = {
    employee?: Employee;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function EmployeeForm({
    employee,
    onClose,
    onSaved,
}: EmployeeFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('employee').toLowerCase();
    const resourceLabel = 'Employee';
    const [formSaving, setSaving] = useState(false);
    const [formError, setError] = useState('');
    const {
        branches,
        departments,
        loading: loadingOrganizations,
        error: organizationError,
    } = useOrganizations();
    const toSelectData = (items: typeof branches) =>
        items.map(({id, name}) => ({value: String(id), label: name}));

    const deactivation = useRecordDeactivation({
        id: employee?.id,
        deactivate: employeeApi.deactivate,
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
        const getText = (name: keyof EmployeeFormValues) => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };

        const result = parseEmployeeForm({
            name: getText('name'),
            emails: getText('emails'),
            phones: getText('phones'),
            branch_id: getText('branch_id'),
            department_id: getText('department_id'),
        });

        if (result.error !== undefined) {
            setError(result.error);
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (employee) {
                await employeeApi.update(employee.id, result.input);
            } else {
                await employeeApi.create(result.input);
            }

            onSaved(
                `${resourceLabel} ${employee ? 'updated' : 'created'} successfully.`,
            );
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Unable to save employee.',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            opened
            centered
            title={t(employee ? 'forms.edit' : 'forms.new', {
                resource,
            })}
            onClose={onClose}
            closeOnClickOutside={!isSaving}
            closeOnEscape={!isSaving}
            withCloseButton={!isSaving}
            size="lg"
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
                            details: t('employeeDetails'),
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
                            color="red"
                            title={t('forms.couldNotLoadOptions')}
                        >
                            {translateMessage(organizationError, t)}
                        </Alert>
                    )}
                    <DeactivationFields
                        editing={employee !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
                    >
                        <Stack>
                            <TextInput
                                autoFocus
                                required
                                label={t('common.fields.fullName')}
                                name="name"
                                autoComplete="name"
                                defaultValue={employee?.name}
                                placeholder={t('forms.alexMorgan')}
                            />
                            <Textarea
                                required
                                label={t('multiValues.emails')}
                                description={t('multiValues.onePerLine')}
                                name="emails"
                                defaultValue={
                                    employee
                                        ? effectiveValues(
                                              employee.email,
                                              employee.emails,
                                          ).join('\n')
                                        : ''
                                }
                                placeholder={t('forms.emailPlaceholder')}
                            />
                            <Textarea
                                label={t('multiValues.phones')}
                                description={t('multiValues.onePerLine')}
                                name="phones"
                                defaultValue={
                                    employee
                                        ? effectiveValues(
                                              employee.phone,
                                              employee.phones,
                                          ).join('\n')
                                        : ''
                                }
                                placeholder={t('common.labels.optional')}
                            />
                            <SimpleGrid cols={{base: 1, sm: 2}}>
                                <Select
                                    required
                                    searchable
                                    allowDeselect={false}
                                    label={t('common.fields.branch')}
                                    name="branch_id"
                                    data={toSelectData(branches)}
                                    defaultValue={
                                        employee
                                            ? String(employee.branch_id)
                                            : null
                                    }
                                    placeholder={t(
                                        'common.messages.selectBranch',
                                    )}
                                    nothingFoundMessage={t(
                                        'common.messages.noBranches',
                                    )}
                                    disabled={
                                        !deactivation.selected &&
                                        loadingOrganizations
                                    }
                                />
                                <Select
                                    required
                                    searchable
                                    allowDeselect={false}
                                    label={t('common.fields.department')}
                                    name="department_id"
                                    data={toSelectData(departments)}
                                    defaultValue={
                                        employee
                                            ? String(employee.department_id)
                                            : null
                                    }
                                    placeholder={t(
                                        'common.messages.selectDepartment',
                                    )}
                                    nothingFoundMessage={t(
                                        'common.messages.noDepartments',
                                    )}
                                    disabled={
                                        !deactivation.selected &&
                                        loadingOrganizations
                                    }
                                />
                            </SimpleGrid>
                        </Stack>
                    </DeactivationFields>
                    {deactivation.selected && (
                        <Text size="sm" c="dimmed">
                            {t('deactivation.employeeUnassignsEquipment')}
                        </Text>
                    )}
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
                                !deactivation.selected &&
                                (loadingOrganizations ||
                                    organizationError.length > 0)
                            }
                        >
                            {deactivation.selected
                                ? t('deactivate', {resource})
                                : employee
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
