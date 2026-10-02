import type {ReactElement} from 'react';
import {
    Alert,
    Button,
    Center,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {Navigate, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {LoginBackgroundStyle} from '../model/background-login';
import {translateMessage, ROUTES} from '@/shared';
import {useSession} from '@/entities';
import {LanguageSwitcher, LoginForm} from '@/features';
import {CompanyLogo} from '@/widgets';

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
        <main className="login-page">
            <div
                className="login-page__visual"
                style={LoginBackgroundStyle}
                aria-hidden="true"
            />
            <section className="login-page__content">
                <Paper className="login-page__card" radius="md">
                    <Stack gap="lg">
                        <Group
                            justify="space-between"
                            align="center"
                            wrap="nowrap"
                        >
                            <CompanyLogo marginLeft={0} />
                            <LanguageSwitcher />
                        </Group>
                        <div>
                            <Text className="login-page__product-name">
                                {t('app.name')}
                            </Text>
                            <Title order={1} className="login-page__title">
                                {t('login.signIn')}
                            </Title>
                            <Text className="login-page__description" mt={6}>
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
                            <LoginForm />
                        ) : (
                            <Alert
                                color="red"
                                title={t('login.unableToCheckSession')}
                                role="alert"
                            >
                                <Stack>
                                    <Text size="sm">
                                        {translateMessage(error, t)}
                                    </Text>
                                    <Button onClick={retry}>
                                        {t('common.actions.retry')}
                                    </Button>
                                </Stack>
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            </section>
        </main>
    );
}
