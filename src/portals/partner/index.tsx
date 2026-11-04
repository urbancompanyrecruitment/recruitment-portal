import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { APP_NAME } from '@/domain/constant';
import { PARTNER_ROUTE } from './constant';
import { RegistrationPage } from './pages/RegistrationPage';
import './partner.css';

const PartnerPortal = () => (
  <div className="partner-layout">
    <header className="partner-header">
      <Link to={PARTNER_ROUTE.registration} className="brand">
        <span className="brand-logo">T</span>
        {APP_NAME}
      </Link>
      <span className="muted small">Urban Company partner registration</span>
    </header>
    <main className="portal-content partner-content">
      <Routes>
        <Route index element={<RegistrationPage />} />
        <Route path="*" element={<Navigate to={PARTNER_ROUTE.registration} replace />} />
      </Routes>
    </main>
  </div>
);

export default PartnerPortal;
