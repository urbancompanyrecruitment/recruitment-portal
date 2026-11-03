import { FetchStub } from './interface';

export const stubFetch = (stubs: FetchStub[]) => {
  const fetchMock = vi.fn();

  stubs.forEach(({ status = 200, body }) =>
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body } as Response),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};
