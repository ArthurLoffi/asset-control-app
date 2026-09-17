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
                    label={t('login.username')}
                    name="user"
                    autoComplete="username"
                    required
                    maxLength={255}
                    disabled={submitting}
                />
                <PasswordInput
                    label={t('login.password')}
                    name="password"
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                />
                <Button type="submit" loading={submitting} fullWidth>
                    {t('login.signIn')}
                </Button>
            </Stack>
        </form>
    );
}
