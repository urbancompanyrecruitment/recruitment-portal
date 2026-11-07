import { stubApi } from '@/test/stubFetch';
import { API_ERROR } from './constant';
import { HttpError, request, requestText } from './http';

describe('http client', () => {
  it('returns the JSON body on success and undefined on 204', async () => {
    stubApi([
      { path: '/partner/interview-cities', body: [{ key: 'tampines' }] },
      { method: 'POST', path: '/partner/auth/logout', status: 204 },
    ]);

    await expect(request('/partner/interview-cities')).resolves.toEqual([{ key: 'tampines' }]);
    await expect(request('/partner/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('maps backend error codes to user-facing messages', async () => {
    stubApi([
      { method: 'POST', path: '/partner/sign-up', status: 409, body: { error: { code: 'PHONE_ALREADY_REGISTERED', message: 'raw' } } },
      { path: '/partner/me', status: 401, body: { error: { code: 'UNAUTHORIZED', message: 'raw' } } },
      { path: '/admin/locks', status: 500, body: {} },
      { path: '/admin/partners', status: 400, body: { error: { code: 'SOMETHING_NEW', message: 'Backend says no' } } },
    ]);

    await expect(request('/partner/sign-up', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 409,
      code: 'PHONE_ALREADY_REGISTERED',
      message: API_ERROR.duplicatePhone,
    });
    await expect(request('/partner/me')).rejects.toMatchObject({ message: API_ERROR.sessionExpired });
    await expect(request('/admin/locks')).rejects.toBeInstanceOf(HttpError);
    await expect(request('/admin/locks')).rejects.toMatchObject({ message: API_ERROR.requestFailed });
    await expect(request('/admin/partners')).rejects.toMatchObject({ message: 'Backend says no' });
  });

  it('sends JSON bodies with same-origin credentials and reads text responses', async () => {
    const fetchMock = stubApi([
      { method: 'POST', path: '/partner/auth/login', body: { id: 'p1' } },
      { path: '/admin/partners/export.csv', text: 'name,location' },
    ]);

    await request('/partner/auth/login', { method: 'POST', body: { primaryPhone: '+65', password: 'x' } });
    await expect(requestText('/admin/partners/export.csv')).resolves.toBe('name,location');

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.credentials).toBe('same-origin');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init?.body))).toEqual({ primaryPhone: '+65', password: 'x' });
  });
});
