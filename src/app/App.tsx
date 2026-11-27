import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { HOME_PATH, PORTAL_PATH } from '@/shared/auth/constant';
import { THEME } from '@/theme/constant';
import { LEGACY_PARTNER_PATHS, LEGACY_PARTNER_PORTAL_PATH } from './constant';
import { LegacyPartnerRedirect } from './LegacyPartnerRedirect';

const HomePortal = lazy(() => import('@/portals/home'));
const PartnerPortal = lazy(() => import('@/portals/partner'));
const RecruiterPortal = lazy(() => import('@/portals/recruiter'));
const AdminPortal = lazy(() => import('@/portals/admin'));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: true } } });

export const App = () => (
  <ConfigProvider theme={THEME}>
    <AntApp>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<Spin fullscreen />}>
            <Routes>
              <Route path={HOME_PATH} element={<HomePortal />} />
              <Route path={`${PORTAL_PATH[UserRole.Partner]}/*`} element={<PartnerPortal />} />
              <Route path={`${PORTAL_PATH[UserRole.Recruiter]}/*`} element={<RecruiterPortal />} />
              <Route path={`${PORTAL_PATH[UserRole.Admin]}/*`} element={<AdminPortal />} />
              <Route path={`${LEGACY_PARTNER_PORTAL_PATH}/*`} element={<LegacyPartnerRedirect />} />
              {LEGACY_PARTNER_PATHS.map(path => (
                <Route key={path} path={path} element={<Navigate to={`${PORTAL_PATH[UserRole.Partner]}${path}`} replace />} />
              ))}
              <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </AntApp>
  </ConfigProvider>
);
