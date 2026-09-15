import type {ReactElement} from 'react';
import {Alert, Button, PasswordInput, Stack, TextInput} from '@mantine/core';
import {useLogin} from '../model/use-login';

export function LoginForm(): ReactElement {
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
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="Username"
                    name="user"
                    autoComplete="username"
                    required
                    maxLength={255}
                    disabled={submitting}
                />
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                />
                <Button type="submit" loading={submitting} fullWidth>
                    Sign in
                </Button>
            </Stack>
        </form>
    );
}
