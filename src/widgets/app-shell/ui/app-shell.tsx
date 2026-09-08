import { Header, Sidebar } from '@/widgets';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactElement } from 'react';

type AppShellProps = {
    children: ReactElement;
    shouldAppear?: boolean;
};

const AppShell = ({ children, shouldAppear = true }: AppShellProps): ReactElement => {
    const [opened, { toggle, close }] = useDisclosure(false);
    return (
        <MantineAppShell
            header={{
                height: shouldAppear ? 60 : 0
            }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: {
                    mobile: !opened,
                    desktop: false,
                },
            }}>
            <MantineAppShell.Header display={shouldAppear ? 'block' : 'none'}>
                <Header opened={opened} onClick={toggle} />
            </MantineAppShell.Header>
            <MantineAppShell.Navbar p="md" style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
                <Sidebar onNavigate={close} />
            </MantineAppShell.Navbar>
            <MantineAppShell.Main>
                {children}
            </MantineAppShell.Main>
        </MantineAppShell >
    );
};

export default AppShell;