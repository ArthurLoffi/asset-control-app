import {ActionIcon, Box, Burger, Group} from '@mantine/core';
import {IconLogout} from '@tabler/icons-react';
import type {ReactElement} from 'react';

type HeaderProps = {
    opened: boolean;
    onClick: () => void;
};

const Header = ({opened, onClick}: HeaderProps): ReactElement => (
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
            <ActionIcon
                variant="subtle"
                size="lg"
                aria-label="Logout"
                ml="auto"
            >
                <IconLogout stroke={1.5} color="#ffffff" />
            </ActionIcon>
        </Box>
    </Group>
);

export default Header;
