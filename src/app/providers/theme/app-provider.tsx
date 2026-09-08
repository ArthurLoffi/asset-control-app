import {MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';
import type {ReactElement, ReactNode} from 'react';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import {theme} from './theme.js';

export const AppProviders = ({
    children,
}: {
    children: ReactNode;
}): ReactElement => (
    <MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
);
