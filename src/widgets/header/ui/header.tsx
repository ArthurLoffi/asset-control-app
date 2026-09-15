import {Box, Burger, Group, Text} from '@mantine/core';
import type {ReactElement} from 'react';
import {LogoutButton} from '@/features';
import {useSession} from '@/entities';

type HeaderProps = {
    opened: boolean;
    onClick: () => void;
};

const Header = ({opened, onClick}: HeaderProps): ReactElement => {
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
                />
                <Group ml="auto">
                    <Text size="sm">{session?.name}</Text>
                    <LogoutButton />
                </Group>
            </Box>
        </Group>
    );
};

export default Header;
