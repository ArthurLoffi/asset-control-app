import type {ReactElement} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {AppRouter} from './providers/index.js';
import {AppProviders} from './providers/theme/app-provider.js';
import {AppShell} from '@/widgets';

export const App = (): ReactElement => (
    <BrowserRouter>
        <AppProviders>
            <AppShell>
                <AppRouter />
            </AppShell>
        </AppProviders>
    </BrowserRouter>
);
