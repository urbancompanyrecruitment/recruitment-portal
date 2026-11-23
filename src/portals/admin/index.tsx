import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole, SignedOutOnly } from '@/shared/auth/session';
import { AdminLayout } from './components/AdminLayout';
import { ADMIN_HOME_PATH, ADMIN_ROUTE } from './constant';
import { AdminsPage } from './pages/AdminsPage';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { PartnersPage } from './pages/PartnersPage';
import { PlacementsPage } from './pages/PlacementsPage';
import { RecruitersPage } from './pages/RecruitersPage';
import './admin.css';

const AdminPortal = () => (
  <Routes>
    <Route
      path={ADMIN_ROUTE.login}
      element={
        <SignedOutOnly role={UserRole.Admin} to={ADMIN_HOME_PATH}>
          <LoginPage />
        </SignedOutOnly>
      }
    />
    <Route
      element={
        <RequireRole role={UserRole.Admin}>
          <AdminLayout />
        </RequireRole>
      }
    >
      <Route index element={<Navigate to={ADMIN_HOME_PATH} replace />} />
      <Route path={ADMIN_ROUTE.overview} element={<OverviewPage />} />
      <Route path={ADMIN_ROUTE.partners} element={<PartnersPage />} />
      <Route path={ADMIN_ROUTE.recruiters} element={<RecruitersPage />} />
      <Route path={ADMIN_ROUTE.placements} element={<PlacementsPage />} />
      <Route path={ADMIN_ROUTE.admins} element={<AdminsPage />} />
      <Route path="*" element={<Navigate to={ADMIN_HOME_PATH} replace />} />
    </Route>
  </Routes>
);

export default AdminPortal;
