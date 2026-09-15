import type {ReactElement} from 'react';
import {Alert, Button, Center, Loader, Stack, Text} from '@mantine/core';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useSession} from '@/entities';
import {AppShell} from '@/widgets';
import {ROUTES} from '@/shared';

export function ProtectedLayout(): ReactElement {
    const {session, loading, error, retry} = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <Center mih="100vh">
                <Loader aria-label="Checking session" />
            </Center>
        );
    }

    if (error !== undefined) {
        return (
            <Center mih="100vh">
                <Alert
                    color="red"
                    title="Unable to check your session"
                    role="alert"
                >
                    <Stack>
                        <Text>{error}</Text>
                        <Button onClick={retry}>Try again</Button>
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
