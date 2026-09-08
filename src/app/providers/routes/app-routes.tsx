import type {ReactElement} from 'react';
import {Route, Routes} from 'react-router-dom';
import {HomePage} from '@/pages';
import {ROUTES} from '@/shared';

const AppRouter = (): ReactElement => (
    <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
    </Routes>
);

export default AppRouter;
