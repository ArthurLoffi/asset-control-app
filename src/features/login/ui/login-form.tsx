import type {ReactElement} from 'react';
import {Alert, Button, PasswordInput, Stack, TextInput} from '@mantine/core';
import {useTranslation} from 'react-i18next';
import {useLogin} from '../model/use-login';
import {translateMessage} from '@/shared';

export function LoginForm(): ReactElement {
    const {t} = useTranslation();
    const {submit, submitting, error} = useLogin();
    return (
        <form
            onSubmit={(event) => {
                void submit(event);
            }}
        >
            <Stack>
                {error !== undefined && (
                    <Alert color="red" role="alert">
                        {translateMessage(error, t)}
                    </Alert>
                )}
                <TextInput
                    classNames={{
                        input: 'login-form__control login-form__text-input',
                        label: 'login-form__label',
                    }}
                    label={t('login.username')}
                    name="user"
                    autoComplete="username"
                    radius="sm"
                    size="md"
                    required
                    maxLength={255}
                    disabled={submitting}
                />
                <PasswordInput
                    classNames={{
                        innerInput: 'login-form__password-input',
                        input: 'login-form__control',
                        label: 'login-form__label',
                    }}
                    label={t('login.password')}
                    name="password"
                    autoComplete="current-password"
                    radius="sm"
                    size="md"
                    required
                    disabled={submitting}
                />
                <Button
                    className="login-form__submit"
                    type="submit"
                    loading={submitting}
                    fullWidth
                >
                    {t('login.signIn')}
                </Button>
            </Stack>
        </form>
    );
}
