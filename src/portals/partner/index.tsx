import { Button } from 'antd';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole, SignedOutOnly, useAuth, useSession } from '@/shared/auth/session';
import { PublicShell } from '@/shared/components/PublicShell';
import { NotificationBell } from './components/NotificationBell';
import { PARTNER_HEADER, PARTNER_ROUTE } from './constant';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { StatusPage } from './pages/StatusPage';
import './partner.css';

const PartnerPortal = () => {
  const { signOut } = useAuth();
  const partner = useSession(UserRole.Partner).data;

  return (
    <PublicShell
      leading={partner ? <NotificationBell partnerId={partner.id} /> : undefined}
      actions={
        <>
          <span className="muted small public-header-identity">{partner ? partner.name : PARTNER_HEADER.tagline}</span>
          {partner ? (
            <>
              <Link to={PARTNER_ROUTE.status}>{PARTNER_HEADER.myStatus}</Link>
              <Button size="small" onClick={() => signOut(UserRole.Partner)}>
                {PARTNER_HEADER.signOut}
              </Button>
            </>
          ) : (
            <Link to={PARTNER_ROUTE.login}>{PARTNER_HEADER.checkStatus}</Link>
          )}
        </>
      }
    >
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="register" element={<RegistrationPage />} />
        <Route
          path="login"
          element={
            <SignedOutOnly role={UserRole.Partner} to={PARTNER_ROUTE.status}>
              <LoginPage />
            </SignedOutOnly>
          }
        />
        <Route
          path="status"
          element={
            <RequireRole role={UserRole.Partner}>
              <StatusPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to={PARTNER_ROUTE.home} replace />} />
      </Routes>
    </PublicShell>
  );
};

export default PartnerPortal;
