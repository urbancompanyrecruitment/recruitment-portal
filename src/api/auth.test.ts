import { environment } from '@/config';
import { UserRole } from '@/domain/interface';
import { deleteCookie, readCookie, writeCookie } from '@/shared/utils/cookie';
import { BUSINESS_TOKEN, DASHBOARD_USER_RESPONSE } from '@/test/constant';
import { stubFetch } from '@/test/stubFetch';
import { fetchCurrentUser, signInWithGoogle, signOutBusiness } from './auth';
import { API_ERROR, AUTH_ENDPOINT, TOKEN_COOKIE } from './constant';
import { HttpError } from './http';

const encodeCredential = (email: string) =>
  ['header', btoa(JSON.stringify({ email })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), 'sig'].join('.');

describe('Google sign-in', () => {
  it('exchanges the credential for a dashboard token and loads the current user', async () => {
    const credential = encodeCredential(DASHBOARD_USER_RESPONSE.email);
    const fetchMock = stubFetch([
      { body: { isError: false, success: { data: { token: BUSINESS_TOKEN } } } },
      { body: { isError: false, success: { data: DASHBOARD_USER_RESPONSE } } },
    ]);

    const user = await signInWithGoogle(credential);

    const [loginUrl, loginInit] = fetchMock.mock.calls[0];
    const [, meInit] = fetchMock.mock.calls[1];
    expect(loginUrl).toBe(`${environment.sherlockServerUrl}${AUTH_ENDPOINT.googleLogin}`);
    expect(loginInit.method).toBe('PUT');
    expect(JSON.parse(loginInit.body)).toEqual({ email: DASHBOARD_USER_RESPONSE.email, access_token: credential });
    expect(readCookie(TOKEN_COOKIE)).toBe(BUSINESS_TOKEN);
    expect(meInit.headers.Authorization).toBe(`Bearer ${BUSINESS_TOKEN}`);
    expect(user).toEqual({
      id: 'u-1',
      name: 'Business team',
      role: UserRole.Business,
      subtitle: 'business@urbancompany.com',
      accesses: ['RECRUITMENT_DASHBOARD'],
    });
  });

  it('surfaces the backend message when the account is rejected and stores no token', async () => {
    stubFetch([{ status: 401, body: { isError: true, error: { message: 'Please login with your Urban Company account' } } }]);

    await expect(signInWithGoogle(encodeCredential('someone@gmail.com'))).rejects.toThrow(
      'Please login with your Urban Company account',
    );

    expect(readCookie(TOKEN_COOKIE)).toBeUndefined();
  });

  it('reports an expired token as a 401 HttpError', async () => {
    writeCookie(TOKEN_COOKIE, 'stale-token', 60);
    stubFetch([{ status: 401, body: {} }]);

    const failure = fetchCurrentUser();

    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.toMatchObject({ status: 401, message: API_ERROR.sessionExpired });
  });

  it('removes the token cookie on sign out', () => {
    writeCookie(TOKEN_COOKIE, BUSINESS_TOKEN, 60);

    signOutBusiness();

    expect(readCookie(TOKEN_COOKIE)).toBeUndefined();
  });
});

describe('cookie helpers', () => {
  it('round-trips encoded values and deletes them', () => {
    writeCookie('sample', 'a b=c', 60);

    expect(readCookie('sample')).toBe('a b=c');

    deleteCookie('sample');

    expect(readCookie('sample')).toBeUndefined();
  });
});
