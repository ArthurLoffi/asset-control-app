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
import {emailApi} from '@/entities';
import {DeactivationFields, useRecordDeactivation} from '@/shared';

export function EmailForm(props: EmailFormProps): ReactElement {
    const {email, onClose, onDeactivated} = props;
    const {
        saving: formSaving,
        error: formError,
        handleSubmit,
    } = useEmailForm(props);
    const deactivation = useRecordDeactivation({
        id: email?.id,
        deactivate: emailApi.deactivate,
        onDeactivated() {
            onDeactivated();
        },
    });
    const isSaving = formSaving || deactivation.saving;
    const error =
        deactivation.error.length > 0 ? deactivation.error : formError;

    return (
        <Modal
            opened
            centered
            title={email ? 'Edit email' : 'New email'}
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
                    {error.length > 0 && (
                        <Alert
                            color="red"
                            title="Could not save email"
                            role="alert"
                        >
                            {error}
                        </Alert>
                    )}
                    <DeactivationFields
                        editing={email !== undefined}
                        selected={deactivation.selected}
                        saving={isSaving}
                        onChange={deactivation.setSelected}
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
                    </DeactivationFields>
                    <Group justify="flex-end" mt="sm">
                        <Button
                            variant="default"
                            disabled={isSaving}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSaving}>
                            {deactivation.selected
                                ? 'Deactivate email'
                                : email
                                  ? 'Save changes'
                                  : 'Create email'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
