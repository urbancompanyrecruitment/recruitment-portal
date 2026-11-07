import { Candidate, Recruiter, SessionUser, UserRole } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { AdminProfile } from './interface';

const partnerSession = (partner: Candidate): SessionUser => ({
  id: partner.id,
  name: partner.name,
  role: UserRole.Partner,
  subtitle: partner.primaryPhone ?? '',
  accesses: [],
});

const recruiterSession = (recruiter: Recruiter): SessionUser => ({
  id: recruiter.id,
  name: recruiter.name,
  role: UserRole.Recruiter,
  subtitle: recruiter.company,
  accesses: [],
});

const adminSession = (admin: AdminProfile): SessionUser => ({
  id: admin.id,
  name: admin.name,
  role: UserRole.Business,
  subtitle: admin.email,
  accesses: [],
});

export const signInWithGoogle = async (credential: string): Promise<SessionUser> =>
  adminSession(await request<AdminProfile>(API_PATH.googleLogin, { method: 'POST', body: { credential } }));

export const signInPartner = async (primaryPhone: string, password: string): Promise<SessionUser> =>
  partnerSession(await request<Candidate>(API_PATH.login(UserRole.Partner), { method: 'POST', body: { primaryPhone, password } }));

export const signInRecruiter = async (email: string, password: string): Promise<SessionUser> =>
  recruiterSession(await request<Recruiter>(API_PATH.login(UserRole.Recruiter), { method: 'POST', body: { email, password } }));

export const fetchCurrentUser = async (role: UserRole): Promise<SessionUser> => {
  if (role === UserRole.Partner) return partnerSession(await request<Candidate>(API_PATH.me(role)));

  if (role === UserRole.Recruiter) return recruiterSession(await request<Recruiter>(API_PATH.me(role)));

  return adminSession(await request<AdminProfile>(API_PATH.me(role)));
};

export const signOutRole = (role: UserRole): Promise<void> => request<void>(API_PATH.logout(role), { method: 'POST' });
