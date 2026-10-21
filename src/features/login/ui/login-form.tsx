import type {ReactElement} from 'react';
import {
    Alert,
    Button,
    PasswordInput,
    Stack,
    TextInput,
    VisuallyHidden,
} from '@mantine/core';
import {IconAlertTriangle, IconLock, IconUser} from '@tabler/icons-react';
import {useTranslation} from 'react-i18next';
import {useCapsLock} from '../model/use-caps-lock';
import {useLogin} from '../model/use-login';
import {translateMessage} from '@/shared';

export function LoginForm(): ReactElement {
    const {t} = useTranslation();
    const {submit, submitting, error} = useLogin();
    const {capsLock, detect, reset} = useCapsLock();
    return (
        <form
            onSubmit={(event) => {
                void submit(event);
            }}
        >
            <Stack>
                {error !== undefined && (
                    <Alert
                        color="red"
                        role="alert"
                        icon={<IconAlertTriangle size={18} aria-hidden />}
                    >
                        {translateMessage(error, t)}
                    </Alert>
                )}
                <TextInput
                    classNames={{
                        input: 'login-form__control',
                        label: 'login-form__label',
                        section: 'login-form__section',
                    }}
                    label={t('login.username')}
                    name="user"
                    autoComplete="username"
                    radius="sm"
                    size="md"
                    leftSection={<IconUser size={18} aria-hidden />}
                    required
                    maxLength={255}
                    disabled={submitting}
                />
                <PasswordInput
                    classNames={{
                        input: 'login-form__control',
                        label: 'login-form__label',
                        section: 'login-form__section',
                        description: 'login-form__hint',
                    }}
                    label={t('login.password')}
                    name="password"
                    autoComplete="current-password"
                    radius="sm"
                    size="md"
                    leftSection={<IconLock size={18} aria-hidden />}
                    inputWrapperOrder={[
                        'label',
                        'input',
                        'description',
                        'error',
                    ]}
                    description={capsLock ? t('login.capsLockOn') : undefined}
                    required
                    disabled={submitting}
                    onKeyDown={detect}
                    onKeyUp={detect}
                    onBlur={reset}
                />
                <VisuallyHidden aria-live="polite">
                    {capsLock ? t('login.capsLockOn') : ''}
                </VisuallyHidden>
                <Button
                    className="login-form__submit"
                    type="submit"
                    size="md"
                    loading={submitting}
                    fullWidth
                >
                    {t('login.signIn')}
                </Button>
            </Stack>
        </form>
    );
}
