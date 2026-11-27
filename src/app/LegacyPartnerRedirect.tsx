import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { PORTAL_PATH } from '@/shared/auth/constant';
import { LEGACY_PARTNER_PORTAL_PATH } from './constant';

export const LegacyPartnerRedirect = () => {
  const { pathname, search } = useLocation();

  return <Navigate to={`${PORTAL_PATH[UserRole.Partner]}${pathname.slice(LEGACY_PARTNER_PORTAL_PATH.length)}${search}`} replace />;
};
