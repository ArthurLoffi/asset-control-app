import type {ReactElement} from 'react';
import {Alert, Button, Group} from '@mantine/core';
import {IconLogout} from '@tabler/icons-react';
import {useLogout} from '../model/use-logout';

export function LogoutButton(): ReactElement {
    const {logout, submitting, error} = useLogout();
    return (
        <Group>
            {error !== undefined && (
                <Alert color="red" role="alert">
                    {error}
                </Alert>
            )}
            <Button
                variant="subtle"
                leftSection={<IconLogout size={18} />}
                loading={submitting}
                onClick={() => {
                    void logout();
                }}
            >
                Sign out
            </Button>
        </Group>
    );
}
