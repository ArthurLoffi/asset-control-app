import { HomePage } from '@/pages';
import { ROUTES } from '@/shared';
import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

const AppRouter = (): ReactElement => {
	return (
		<Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
		</Routes>
	);
};

export default AppRouter;