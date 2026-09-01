import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './providers';

export const App = (): ReactElement => {
  return (
    <BrowserRouter>
          <AppRouter />
    </BrowserRouter>
  );
};