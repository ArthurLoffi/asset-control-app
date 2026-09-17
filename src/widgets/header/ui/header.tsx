import {Box, Burger, Group, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import CompanyLogo from './company-logo';
import {LanguageSwitcher, LogoutButton} from '@/features';
import {useSession} from '@/entities';

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
                <Group ml="auto" wrap="nowrap" gap="xs" style={{minWidth: 0}}>
                    <Text
                        size="sm"
                        aria-label={t('signedInAs')}
                        visibleFrom="sm"
                        truncate
                        maw={{sm: 160, lg: 280}}
                        style={{minWidth: 0}}
                    >
                        {session?.name}
                    </Text>
                    <LanguageSwitcher />
                    <LogoutButton />
                </Group>
            </Box>
        </Group>
    );
};

export default Header;
