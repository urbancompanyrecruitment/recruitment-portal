import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { App as AntApp, ConfigProvider } from 'antd';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QUERY_KEY } from '@/api/constant';
import { UserRole } from '@/domain/interface';
import { THEME } from '@/theme/constant';
import { RenderOptions } from './interface';

export const renderWithProviders = (ui: ReactElement, { route = '/', sessions = {} }: RenderOptions = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  Object.entries(sessions).forEach(([role, user]) => queryClient.setQueryData(QUERY_KEY.currentUser(role as UserRole), user));

  return {
    queryClient,
    ...render(
      <ConfigProvider theme={THEME}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>,
    ),
  };
};
