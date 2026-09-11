import type {ReactElement} from 'react';
import {Route, Routes} from 'react-router-dom';
import {HomePage} from '@/pages';
import {EmployeesPage} from '@/pages/employees-page/index.js';
import {ROUTES} from '@/shared';

const AppRouter = (): ReactElement => (
    <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
    </Routes>
);

export default AppRouter;
