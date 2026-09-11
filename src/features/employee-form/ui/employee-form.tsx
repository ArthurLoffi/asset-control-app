import {useState, type SubmitEvent} from 'react';
import {
    Alert,
    Button,
    Group,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import {employeeApi, type Employee} from '@/entities/employee/index.js';

type EmployeeFormProps = {
    employee?: Employee;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function EmployeeForm({employee, onClose, onSaved}: EmployeeFormProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) {
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
                'Enter a name, email, and valid positive branch and department IDs.',
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
            closeOnClickOutside={!saving}
            closeOnEscape={!saving}
            withCloseButton={!saving}
            size="lg"
        >
            <form
                onSubmit={(event) => {
                    void handleSubmit(event);
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
                    <fieldset
                        disabled={saving}
                        style={{border: 0, padding: 0, margin: 0, minWidth: 0}}
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
                                <TextInput
                                    required
                                    type="number"
                                    min={1}
                                    max={Number.MAX_SAFE_INTEGER}
                                    step={1}
                                    label="Branch ID"
                                    name="branch_id"
                                    defaultValue={employee?.branch_id}
                                    placeholder="e.g. 1"
                                />
                                <TextInput
                                    required
                                    type="number"
                                    min={1}
                                    max={Number.MAX_SAFE_INTEGER}
                                    step={1}
                                    label="Department ID"
                                    name="department_id"
                                    defaultValue={employee?.department_id}
                                    placeholder="e.g. 1"
                                />
                            </SimpleGrid>
                        </Stack>
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
                            {employee ? 'Save changes' : 'Create employee'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
