import type {ReactElement} from 'react';
import {
    Alert,
    Button,
    Center,
    Container,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {Navigate, useLocation} from 'react-router-dom';
import {useSession} from '@/entities';
import {LoginForm} from '@/features';
import {ROUTES} from '@/shared';

export function LoginPage(): ReactElement {
    const {session, loading, error, expired, signedOut, retry} = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <Center mih="100vh">
                <Loader aria-label="Checking session" />
            </Center>
        );
    }

    if (session) {
        const state = location.state as {from?: unknown} | undefined;
        const requested = state?.from;
        const destination =
            typeof requested === 'string' &&
            Object.values(ROUTES).some(
                (route) =>
                    route !== ROUTES.LOGIN &&
                    route === requested.split('?', 1)[0],
            )
                ? requested
                : ROUTES.HOME;
        return <Navigate to={destination} replace />;
    }

    return (
        <Container size={440} py={80}>
            <Stack gap="lg">
                <div>
                    <Title order={1}>Asset Control</Title>
                    <Text c="dimmed" mt="xs">
                        Sign in to manage your IT inventory.
                    </Text>
                </div>
                {expired && (
                    <Alert color="yellow" role="alert">
                        Your session expired. Please sign in again.
                    </Alert>
                )}
                {signedOut && (
                    <Alert color="green" role="status">
                        You have been signed out.
                    </Alert>
                )}
                {error === undefined ? (
                    <Paper withBorder p="xl" radius="md">
                        <LoginForm />
                    </Paper>
                ) : (
                    <Alert
                        color="red"
                        title="Unable to check your session"
                        role="alert"
                    >
                        <Stack>
                            <Text size="sm">{error}</Text>
                            <Button onClick={retry}>Try again</Button>
                        </Stack>
                    </Alert>
                )}
            </Stack>
        </Container>
    );
}
