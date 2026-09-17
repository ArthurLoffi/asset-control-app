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
import {useTranslation} from 'react-i18next';
import {useEmailForm, type EmailFormProps} from '../model/use-email-form';
import {
    translateMessage,
    DeactivationFields,
    useRecordDeactivation,
} from '@/shared';
import {emailApi} from '@/entities';

export function EmailForm(props: EmailFormProps): ReactElement {
    const {t} = useTranslation();
    const resource = t('email').toLowerCase();
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
            title={t(email ? 'forms.edit' : 'forms.new', {resource})}
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
                            title={t('forms.couldNotSave', {resource})}
                            role="alert"
                        >
                            {translateMessage(error, t)}
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
                                label={t('common.fields.user')}
                                name="user"
                                autoComplete="off"
                                defaultValue={email?.user}
                            />
                            <TextInput
                                required
                                label={t('common.fields.emailAddress')}
                                name="email"
                                type="email"
                                autoComplete="off"
                                defaultValue={email?.email}
                            />
                            <PasswordInput
                                visibilityToggleFocusable
                                required
                                label={t('common.fields.password')}
                                name="password_hash"
                                autoComplete="new-password"
                                defaultValue={email?.password_hash}
                                visibilityToggleButtonProps={{
                                    'aria-label': t('togglePasswordVisibility'),
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
                            {t('common.actions.cancel')}
                        </Button>
                        <Button type="submit" loading={isSaving}>
                            {deactivation.selected
                                ? t('deactivate', {resource})
                                : email
                                  ? t('common.actions.saveChanges')
                                  : t('forms.create', {resource})}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
