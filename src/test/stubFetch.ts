import { ROLE_API_SEGMENT } from '@/api/constant';
import { environment } from '@/config';
import { UserRole } from '@/domain/interface';
import { ApiStub } from './interface';

const BASE_URL = 'http://localhost';

export const signedOut = (role: UserRole): ApiStub => ({
  path: `/${ROLE_API_SEGMENT[role]}/auth/me`,
  status: 401,
  body: { error: { code: 'UNAUTHORIZED' } },
});

export const stubApi = (stubs: ApiStub[]) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), BASE_URL);
    const method = init?.method ?? 'GET';
    const candidates = stubs.filter(item => (item.method ?? 'GET') === method);
    const stub =
      candidates.find(item => `${environment.apiBaseUrl}${item.path}` === `${url.pathname}${url.search}`) ??
      candidates.find(item => `${environment.apiBaseUrl}${item.path}` === url.pathname);

    if (!stub) throw new Error(`No API stub for ${method} ${url.pathname}`);

    const status = stub.status ?? 200;

    return {
      ok: status < 400,
      status,
      json: async () => stub.body,
      text: async () => stub.text ?? '',
    } as Response;
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

export const requestsTo = (fetchMock: ReturnType<typeof stubApi>, method: string, path: string) =>
  fetchMock.mock.calls
    .filter(([input, init]) => (init?.method ?? 'GET') === method && new URL(String(input), BASE_URL).pathname === `${environment.apiBaseUrl}${path}`)
    .map(([, init]) => (init?.body ? JSON.parse(String(init.body)) : undefined));
