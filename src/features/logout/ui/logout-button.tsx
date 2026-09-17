import type {ReactElement} from 'react';
import {Alert, Button, Group} from '@mantine/core';
import {IconLogout} from '@tabler/icons-react';
import {useTranslation} from 'react-i18next';
import {useLogout} from '../model/use-logout';
import {translateMessage} from '@/shared';

export function LogoutButton(): ReactElement {
    const {t} = useTranslation();
    const {logout, submitting, error} = useLogout();
    return (
        <Group wrap="nowrap" style={{flexShrink: 0}}>
            {error !== undefined && (
                <Alert
                    color="red"
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: 64,
                        right: 14,
                        maxWidth: 'calc(100vw - 28px)',
                        zIndex: 300,
                    }}
                >
                    {translateMessage(error, t)}
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
                {t('logout')}
            </Button>
        </Group>
    );
}
