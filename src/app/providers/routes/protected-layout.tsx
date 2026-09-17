import type {ReactElement} from 'react';
import {Alert, Button, Center, Loader, Stack, Text} from '@mantine/core';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {translateMessage, ROUTES} from '@/shared';
import {useSession} from '@/entities';
import {AppShell} from '@/widgets';

export function ProtectedLayout(): ReactElement {
    const {t} = useTranslation();
    const {session, loading, error, retry} = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <Center mih="100vh">
                <Loader aria-label={t('checkingSession')} />
            </Center>
        );
    }

    if (error !== undefined) {
        return (
            <Center mih="100vh">
                <Alert
                    color="red"
                    title={t('login.unableToCheckSession')}
                    role="alert"
                >
                    <Stack>
                        <Text>{translateMessage(error, t)}</Text>
                        <Button onClick={retry}>
                            {t('common.actions.retry')}
                        </Button>
                    </Stack>
                </Alert>
            </Center>
        );
    }

    if (!session) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{from: location.pathname + location.search}}
                replace
            />
        );
    }

    return (
        <AppShell>
            <Outlet />
        </AppShell>
    );
}
