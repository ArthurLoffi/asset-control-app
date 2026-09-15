import type {ReactElement} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {AppRouter} from './providers';
import {AppProviders} from './providers/theme/app-provider';
import {SessionProvider} from '@/entities';

export const App = (): ReactElement => (
    <BrowserRouter>
        <AppProviders>
            <SessionProvider>
                <AppRouter />
            </SessionProvider>
        </AppProviders>
    </BrowserRouter>
);
