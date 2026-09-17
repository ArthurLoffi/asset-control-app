import type {ReactElement} from 'react';
import {
    Alert,
    Button,
    Center,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {Navigate, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {translateMessage, ROUTES} from '@/shared';
import {useSession} from '@/entities';
import {LanguageSwitcher, LoginForm} from '@/features';

export function LoginPage(): ReactElement {
    const {t} = useTranslation();
    const {session, loading, error, expired, signedOut, retry} = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <Center mih="100vh">
                <Loader aria-label={t('checkingSession')} />
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
        <Container size={480} py={{base: 32, sm: 80}}>
            <Stack gap="lg">
                <div>
                    <Group
                        justify="space-between"
                        wrap="nowrap"
                        align="flex-start"
                    >
                        <Title order={1} style={{minWidth: 0}}>
                            {t('app.name')}
                        </Title>
                        <LanguageSwitcher />
                    </Group>
                    <Text c="dimmed" mt="xs">
                        {t('login.description')}
                    </Text>
                </div>
                {expired && (
                    <Alert color="yellow" role="alert">
                        {t('login.sessionExpired')}
                    </Alert>
                )}
                {signedOut && (
                    <Alert color="green" role="status">
                        {t('login.signedOut')}
                    </Alert>
                )}
                {error === undefined ? (
                    <Paper withBorder p="xl" radius="md">
                        <LoginForm />
                    </Paper>
                ) : (
                    <Alert
                        color="red"
                        title={t('login.unableToCheckSession')}
                        role="alert"
                    >
                        <Stack>
                            <Text size="sm">{translateMessage(error, t)}</Text>
                            <Button onClick={retry}>
                                {t('common.actions.retry')}
                            </Button>
                        </Stack>
                    </Alert>
                )}
            </Stack>
        </Container>
    );
}
