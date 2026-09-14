import {
    Alert,
    Button,
    Group,
    Modal,
    PasswordInput,
    Stack,
    TextInput,
} from '@mantine/core';
import type {ReactElement} from 'react';
import {useEmailForm, type EmailFormProps} from '../model/use-email-form';

export function EmailForm(props: EmailFormProps): ReactElement {
    const {email, onClose} = props;
    const {saving, error, handleSubmit} = useEmailForm(props);
    return (
        <Modal
            opened
            centered
            title={email ? 'Edit email' : 'New email'}
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
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save email"
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
                                label="User"
                                name="user"
                                autoComplete="off"
                                defaultValue={email?.user}
                            />
                            <TextInput
                                required
                                label="Email address"
                                name="email"
                                type="email"
                                autoComplete="off"
                                defaultValue={email?.email}
                            />
                            <PasswordInput
                                visibilityToggleFocusable
                                required
                                label="Password"
                                name="password_hash"
                                autoComplete="new-password"
                                defaultValue={email?.password_hash}
                                visibilityToggleButtonProps={{
                                    'aria-label': 'Toggle password visibility',
                                }}
                            />
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
                            {email ? 'Save changes' : 'Create email'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
