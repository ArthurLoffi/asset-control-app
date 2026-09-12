import {lazy, Suspense, type ReactElement} from 'react';
import {Center, Loader} from '@mantine/core';
import {Route, Routes} from 'react-router-dom';
import {HomePage} from '@/pages';
import {ROUTES} from '@/shared';

const EmployeesPage = lazy(async () => import('@/pages/employees-page'));
const MachinesPage = lazy(async () => import('@/pages/machines-page'));
const PhonesPage = lazy(async () => import('@/pages/phones-page'));
const MonitorsPage = lazy(async () => import('@/pages/monitors-page'));

const AppRouter = (): ReactElement => (
    <Suspense
        fallback={
            <Center mih={240}>
                <Loader size="sm" />
            </Center>
        }
    >
        <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
            <Route path={ROUTES.MACHINES} element={<MachinesPage />} />
            <Route path={ROUTES.PHONES} element={<PhonesPage />} />
            <Route path={ROUTES.MONITORS} element={<MonitorsPage />} />
        </Routes>
    </Suspense>
);

export default AppRouter;
