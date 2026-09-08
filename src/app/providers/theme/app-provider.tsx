import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import type { ReactElement, ReactNode } from 'react';
import { theme } from './theme';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

export const AppProviders = ({
	children,
}: {
	children: ReactNode;
}): ReactElement => {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<ModalsProvider>{children}</ModalsProvider>
		</MantineProvider>
	);
};