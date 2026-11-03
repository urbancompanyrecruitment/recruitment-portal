import { environment } from '@/config';
import { SessionUser, UserRole } from '@/domain/interface';
import { DEMO_PASSWORD } from '@/mocks/constant';
import { deleteCookie, writeCookie } from '@/shared/utils/cookie';
import { mockQuery } from './client';
import { API_ERROR, AUTH_ENDPOINT, TOKEN_COOKIE, TOKEN_COOKIE_MAX_AGE_SECONDS } from './constant';
import { request } from './http';
import { DashboardUser, GoogleIdTokenPayload, GoogleLoginResponse } from './interface';

export const fetchCurrentUser = async (): Promise<SessionUser> => {
  const user = await request<DashboardUser>(`${environment.sherlockApiUrl}${AUTH_ENDPOINT.currentUser}`);

  return { id: user._id, name: user.name, role: UserRole.Business, subtitle: user.email, accesses: user.team ?? [] };
};

export const signInWithGoogle = async (credential: string): Promise<SessionUser> => {
  const [, payload = ''] = credential.split('.');
  const { email } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as GoogleIdTokenPayload;

  const { token } = await request<GoogleLoginResponse>(`${environment.sherlockServerUrl}${AUTH_ENDPOINT.googleLogin}`, {
    method: 'PUT',
    body: { email, access_token: credential },
  });

  writeCookie(TOKEN_COOKIE, token, TOKEN_COOKIE_MAX_AGE_SECONDS);

  return fetchCurrentUser();
};

export const signOutBusiness = (): void => deleteCookie(TOKEN_COOKIE);

export const signInRecruiter = (loginId: string, password: string): Promise<SessionUser> =>
  mockQuery(db => {
    const recruiter = db.recruiters.find(item => item.active && item.loginId === loginId.trim());

    if (!recruiter || password !== DEMO_PASSWORD) throw new Error(API_ERROR.invalidCredentials);

    return { id: recruiter.id, name: recruiter.name, role: UserRole.Recruiter, subtitle: recruiter.company, accesses: [] };
  });
