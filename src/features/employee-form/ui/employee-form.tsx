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
import {employeeApi, type Employee, useOrganizations} from '@/entities';
import {DeactivationFields, useRecordDeactivation} from '@/shared';

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
            onSaved('Employee deactivated successfully.');
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
        const getText = (name: string) => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };

        const input = {
            name: getText('name'),
            email: getText('email'),
            phone: getText('phone'),
            branch_id: Number(getText('branch_id')),
            department_id: Number(getText('department_id')),
        };

        if (
            input.name.length === 0 ||
            input.email.length === 0 ||
            [input.branch_id, input.department_id].some(
                (id) => !(Number.isSafeInteger(id) && id > 0),
            )
        ) {
            setError(
                'Enter a name and email, then select a branch and department.',
            );
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (employee) {
                await employeeApi.update(employee.id, input);
            } else {
                await employeeApi.create(input);
            }

            onSaved(
                employee
                    ? 'Employee updated successfully.'
                    : 'Employee created successfully.',
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
            title={employee ? 'Edit employee' : 'New employee'}
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
                        Keep contact and organization details up to date.
                    </Text>
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save employee"
                            role="alert"
                        >
                            {error}
                        </Alert>
                    )}
                    {organizationError.length > 0 && (
                        <Alert color="red" title="Could not load form options">
                            {organizationError}
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
                                label="Full name"
                                name="name"
                                autoComplete="name"
                                defaultValue={employee?.name}
                                placeholder="e.g. Alex Morgan"
                            />
                            <TextInput
                                required
                                type="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                defaultValue={employee?.email}
                                placeholder="alex@company.com"
                            />
                            <TextInput
                                type="tel"
                                label="Phone"
                                name="phone"
                                autoComplete="tel"
                                defaultValue={employee?.phone}
                                placeholder="Optional"
                            />
                            <SimpleGrid cols={{base: 1, sm: 2}}>
                                <Select
                                    required
                                    searchable
                                    allowDeselect={false}
                                    label="Branch"
                                    name="branch_id"
                                    data={toSelectData(branches)}
                                    defaultValue={
                                        employee
                                            ? String(employee.branch_id)
                                            : null
                                    }
                                    placeholder="Select a branch"
                                    nothingFoundMessage="No branches found"
                                    disabled={
                                        !deactivation.selected &&
                                        loadingOrganizations
                                    }
                                />
                                <Select
                                    required
                                    searchable
                                    allowDeselect={false}
                                    label="Department"
                                    name="department_id"
                                    data={toSelectData(departments)}
                                    defaultValue={
                                        employee
                                            ? String(employee.department_id)
                                            : null
                                    }
                                    placeholder="Select a department"
                                    nothingFoundMessage="No departments found"
                                    disabled={
                                        !deactivation.selected &&
                                        loadingOrganizations
                                    }
                                />
                            </SimpleGrid>
                        </Stack>
                    </DeactivationFields>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={isSaving}
                            onClick={onClose}
                        >
                            Cancel
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
                                ? 'Deactivate employee'
                                : employee
                                  ? 'Save changes'
                                  : 'Create employee'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
