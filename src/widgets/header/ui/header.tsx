import {
    Avatar,
    Box,
    Burger,
    Group,
    Text,
    ThemeIcon,
    UnstyledButton,
    VisuallyHidden,
} from '@mantine/core';
import {IconPackages} from '@tabler/icons-react';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import CompanyLogo from './company-logo';
import {LanguageSwitcher, LogoutButton} from '@/features';
import {useSession} from '@/entities';
import {ROUTES} from '@/shared';

type HeaderProps = {
    opened: boolean;
    onClick: () => void;
};

const Header = ({opened, onClick}: HeaderProps): ReactElement => {
    const {t} = useTranslation();
    const {session} = useSession();
    return (
        <Group>
            <Box
                w="100%"
                h={60}
                px="md"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Burger
                    opened={opened}
                    onClick={onClick}
                    hiddenFrom="sm"
                    size="sm"
                    aria-label={t('common.actions.toggleNavigation')}
                    style={{flexShrink: 0}}
                />
                <CompanyLogo />
                <UnstyledButton
                    component={Link}
                    to={ROUTES.HOME}
                    aria-label={t('app.name')}
                    ml="sm"
                    style={{flexShrink: 0}}
                >
                    <Group gap="xs" wrap="nowrap">
                        <ThemeIcon variant="light" size={34} aria-hidden>
                            <IconPackages size={20} stroke={1.6} />
                        </ThemeIcon>
                        <Text fw={700} size="md" visibleFrom="xs">
                            {t('app.name')}
                        </Text>
                    </Group>
                </UnstyledButton>
                <Group ml="auto" wrap="nowrap" gap="xs" style={{minWidth: 0}}>
                    {session !== undefined && (
                        <Group
                            gap="xs"
                            wrap="nowrap"
                            visibleFrom="sm"
                            style={{minWidth: 0}}
                        >
                            <Avatar
                                name={session.name}
                                color="initials"
                                size={30}
                                aria-hidden
                            />
                            <Text
                                size="sm"
                                fw={500}
                                truncate
                                maw={{sm: 160, lg: 280}}
                                style={{minWidth: 0}}
                            >
                                <VisuallyHidden>
                                    {t('signedInAs')}{' '}
                                </VisuallyHidden>
                                <span>{session.name}</span>
                            </Text>
                        </Group>
                    )}
                    <LanguageSwitcher />
                    <LogoutButton />
                </Group>
            </Box>
        </Group>
    );
};

export default Header;
