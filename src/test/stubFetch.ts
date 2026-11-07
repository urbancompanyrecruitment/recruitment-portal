import { environment } from '@/config';
import { ApiStub } from './interface';

const BASE_URL = 'http://localhost';

export const stubApi = (stubs: ApiStub[]) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), BASE_URL);
    const method = init?.method ?? 'GET';
    const stub = stubs.find(item => (item.method ?? 'GET') === method && `${environment.apiBaseUrl}${item.path}` === url.pathname);

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
