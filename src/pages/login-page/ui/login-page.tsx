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
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    IconDevices,
    IconHistory,
    IconPackages,
    IconUsersGroup,
    type Icon,
} from '@tabler/icons-react';
import {Navigate, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {LoginBackgroundStyle} from '../model/background-login';
import {translateMessage, ROUTES} from '@/shared';
import {useSession} from '@/entities';
import {LanguageSwitcher, LoginForm} from '@/features';
import {CompanyLogo} from '@/widgets';

const loginFeatures: Array<[Icon, string]> = [
    [IconDevices, 'login.features.inventory'],
    [IconUsersGroup, 'login.features.assignments'],
    [IconHistory, 'login.features.history'],
];

function LoginIntro(): ReactElement {
    const {t} = useTranslation();
    return (
        <section className="login-page__intro">
            <Stack gap="lg" maw={520}>
                <Title order={2} className="login-page__hero-title">
                    {t('login.heroTitle')}
                </Title>
                <Text className="login-page__hero-description">
                    {t('login.heroDescription')}
                </Text>
                <Stack component="ul" gap="sm" className="login-page__features">
                    {loginFeatures.map(([FeatureIcon, key]) => (
                        <Group
                            key={key}
                            component="li"
                            gap="sm"
                            wrap="nowrap"
                            align="center"
                        >
                            <ThemeIcon
                                variant="light"
                                size={36}
                                className="login-page__feature-icon"
                                aria-hidden
                            >
                                <FeatureIcon size={20} stroke={1.6} />
                            </ThemeIcon>
                            <Text className="login-page__feature-text">
                                {t(key)}
                            </Text>
                        </Group>
                    ))}
                </Stack>
            </Stack>
        </section>
    );
}

export function LoginPage(): ReactElement {
    const {t} = useTranslation();
    const {session, loading, error, expired, signedOut, retry} = useSession();
    const location = useLocation();
    if (loading) {
        return (
            <Center mih="100dvh" className="login-page__loading">
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
                        <CompanyLogo marginLeft={0} />
                        <div>
                            <Group
                                justify="space-between"
                                wrap="nowrap"
                                mb="sm"
                            >
                                <Group gap="xs" wrap="nowrap">
                                    <ThemeIcon
                                        variant="light"
                                        size={32}
                                        aria-hidden
                                    >
                                        <IconPackages size={18} stroke={1.6} />
                                    </ThemeIcon>
                                    <Text className="login-page__product-name">
                                        {t('app.name')}
                                    </Text>
                                </Group>
                                <LanguageSwitcher />
                            </Group>
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
            <LoginIntro />
        </main>
    );
}
