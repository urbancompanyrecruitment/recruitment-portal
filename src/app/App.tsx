import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { THEME } from '@/theme/constant';

const PartnerPortal = lazy(() => import('@/portals/partner'));
const RecruiterPortal = lazy(() => import('@/portals/recruiter'));
const BusinessPortal = lazy(() => import('@/portals/business'));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: true } } });

export const App = () => (
  <ConfigProvider theme={THEME}>
    <AntApp>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Spin fullscreen />}>
              <Routes>
                <Route path="/recruiter/*" element={<RecruiterPortal />} />
                <Route path="/business/*" element={<BusinessPortal />} />
                <Route path="/*" element={<PartnerPortal />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </AntApp>
  </ConfigProvider>
);
