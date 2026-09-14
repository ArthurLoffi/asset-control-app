import {lazy, Suspense, type ReactElement} from 'react';
import {Center, Loader} from '@mantine/core';
import {Route, Routes} from 'react-router-dom';
import {ROUTES} from '@/shared';

const EmployeesPage = lazy(async () => import('@/pages/employees-page'));
const HomePage = lazy(async () => import('@/pages/home-page'));
const MachinesPage = lazy(async () => import('@/pages/machines-page'));
const PhonesPage = lazy(async () => import('@/pages/phones-page'));
const PrintersPage = lazy(async () => import('@/pages/printers-page'));
const MonitorsPage = lazy(async () => import('@/pages/monitors-page'));
const EmailsPage = lazy(async () => import('@/pages/emails-page'));

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
            <Route path={ROUTES.PRINTERS} element={<PrintersPage />} />
            <Route path={ROUTES.MONITORS} element={<MonitorsPage />} />
            <Route path={ROUTES.EMAILS} element={<EmailsPage />} />
        </Routes>
    </Suspense>
);

export default AppRouter;
