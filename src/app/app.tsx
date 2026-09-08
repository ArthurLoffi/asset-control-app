import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './providers';
import { AppShell } from '@/widgets';
import { AppProviders } from './providers/theme/app-provider';

export const App = (): ReactElement => {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppShell>
          <AppRouter />
        </AppShell>
      </AppProviders>
    </BrowserRouter>
  );
};