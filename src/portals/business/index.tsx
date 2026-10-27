import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole } from '@/shared/auth/AuthProvider';
import { PortalShell } from '@/shared/components/PortalShell';
import { StaffLogin } from '@/shared/components/StaffLogin';
import {
  BUSINESS_DEMO_ACCOUNTS,
  BUSINESS_HOME_PATH,
  BUSINESS_LOGIN,
  BUSINESS_NAV_ITEMS,
  BUSINESS_ROUTE,
  BUSINESS_WORKSPACE,
  SIDEBAR_FOOTER,
} from './constant';
import { OverviewPage } from './pages/OverviewPage';
import { PlacementsPage } from './pages/PlacementsPage';
import { RecruitersPage } from './pages/RecruitersPage';
import { TrainersPage } from './pages/TrainersPage';
import './business.css';

const BusinessPortal = () => (
  <Routes>
    <Route
      path={BUSINESS_ROUTE.login}
      element={
        <StaffLogin
          role={UserRole.Business}
          title={BUSINESS_LOGIN.title}
          subtitle={BUSINESS_LOGIN.subtitle}
          demoAccounts={BUSINESS_DEMO_ACCOUNTS}
        />
      }
    />
    <Route
      element={
        <RequireRole role={UserRole.Business}>
          <PortalShell
            role={UserRole.Business}
            workspace={BUSINESS_WORKSPACE}
            navItems={BUSINESS_NAV_ITEMS}
            sidebarFooter={
              <>
                <div>{SIDEBAR_FOOTER.note}</div>
                <Link to={SIDEBAR_FOOTER.directoryPath} className="business-footer-link">
                  {SIDEBAR_FOOTER.directoryLabel}
                </Link>
              </>
            }
          />
        </RequireRole>
      }
    >
      <Route index element={<Navigate to={BUSINESS_HOME_PATH} replace />} />
      <Route path={BUSINESS_ROUTE.overview} element={<OverviewPage />} />
      <Route path={BUSINESS_ROUTE.trainers} element={<TrainersPage />} />
      <Route path={BUSINESS_ROUTE.recruiters} element={<RecruitersPage />} />
      <Route path={BUSINESS_ROUTE.placements} element={<PlacementsPage />} />
      <Route path="*" element={<Navigate to={BUSINESS_HOME_PATH} replace />} />
    </Route>
  </Routes>
);

export default BusinessPortal;
