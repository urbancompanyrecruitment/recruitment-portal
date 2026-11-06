import { Button } from 'antd';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { APP_NAME } from '@/domain/constant';
import { UserRole } from '@/domain/interface';
import { RequireRole, useAuth } from '@/shared/auth/AuthProvider';
import { PARTNER_HEADER, PARTNER_ROUTE } from './constant';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { StatusPage } from './pages/StatusPage';
import './partner.css';

const PartnerPortal = () => {
  const { sessions, signOut } = useAuth();
  const partner = sessions[UserRole.Partner];

  return (
    <div className="partner-layout">
      <header className="partner-header">
        <Link to={PARTNER_ROUTE.registration} className="brand">
          <span className="brand-logo">T</span>
          {APP_NAME}
        </Link>
        <span className="partner-header-actions">
          <span className="muted small">{partner ? partner.name : PARTNER_HEADER.tagline}</span>
          {partner ? (
            <Button size="small" onClick={() => signOut(UserRole.Partner)}>
              {PARTNER_HEADER.signOut}
            </Button>
          ) : (
            <Link to={PARTNER_ROUTE.login}>{PARTNER_HEADER.checkStatus}</Link>
          )}
        </span>
      </header>
      <main className="portal-content partner-content">
        <Routes>
          <Route index element={<RegistrationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="status"
            element={
              <RequireRole role={UserRole.Partner}>
                <StatusPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to={PARTNER_ROUTE.registration} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default PartnerPortal;
