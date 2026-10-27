import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App as AntApp, ConfigProvider } from 'antd';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { SESSION_STORAGE_KEY } from '@/shared/auth/constant';
import { THEME } from '@/theme/constant';
import { RenderOptions } from './interface';

export const renderWithProviders = (ui: ReactElement, { route = '/', sessions = {} }: RenderOptions = {}) => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <ConfigProvider theme={THEME}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>,
  );
};
