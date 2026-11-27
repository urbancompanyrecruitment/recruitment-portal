import { AdminAccount, Candidate, Recruiter, SessionUser, UserRole } from '@/domain/interface';
import { API_PATH, SIGNED_OUT_STATUSES } from './constant';
import { HttpError, request } from './http';
import { ChangePasswordInput, RecruiterSignUpInput, ResetPasswordInput } from './interface';

const partnerSession = (partner: Candidate): SessionUser => ({
  id: partner.id,
  name: partner.name,
  role: UserRole.Partner,
  subtitle: partner.primaryPhone ?? '',
  approved: true,
});

const recruiterSession = (recruiter: Recruiter): SessionUser => ({
  id: recruiter.id,
  name: recruiter.name,
  role: UserRole.Recruiter,
  subtitle: `${recruiter.company} · ${recruiter.email}`,
  approved: recruiter.active,
  recruiterStatus: recruiter.status,
});

const adminSession = (admin: AdminAccount): SessionUser => ({
  id: admin.id,
  name: admin.name,
  role: UserRole.Admin,
  subtitle: admin.email,
  approved: true,
  adminRole: admin.role,
});

export const signInAdmin = async (email: string, password: string): Promise<SessionUser> =>
  adminSession(await request<AdminAccount>(API_PATH.login(UserRole.Admin), { method: 'POST', body: { email, password } }));

export const signInPartner = async (primaryPhone: string, lastName: string): Promise<SessionUser> =>
  partnerSession(await request<Candidate>(API_PATH.login(UserRole.Partner), { method: 'POST', body: { primaryPhone, lastName } }));

export const signInRecruiter = async (email: string, password: string): Promise<SessionUser> =>
  recruiterSession(await request<Recruiter>(API_PATH.login(UserRole.Recruiter), { method: 'POST', body: { email, password } }));

export const signUpRecruiter = async (input: RecruiterSignUpInput): Promise<SessionUser> =>
  recruiterSession(await request<Recruiter>(API_PATH.recruiterSignUp, { method: 'POST', body: input }));

export const fetchCurrentUser = async (role: UserRole): Promise<SessionUser | null> => {
  try {
    if (role === UserRole.Partner) return partnerSession(await request<Candidate>(API_PATH.me(role)));

    if (role === UserRole.Recruiter) return recruiterSession(await request<Recruiter>(API_PATH.me(role)));

    return adminSession(await request<AdminAccount>(API_PATH.me(role)));
  } catch (error) {
    if (error instanceof HttpError && SIGNED_OUT_STATUSES.includes(error.status)) return null;

    throw error;
  }
};

export const changePassword = (role: UserRole, input: ChangePasswordInput): Promise<void> =>
  request<void>(API_PATH.changePassword(role), { method: 'POST', body: input });

export const signOutRole = (role: UserRole): Promise<void> => request<void>(API_PATH.logout(role), { method: 'POST' });

export const requestPasswordReset = (role: UserRole, email: string): Promise<void> =>
  request<void>(API_PATH.forgotPassword(role), { method: 'POST', body: { email } });

export const resetPassword = (role: UserRole, input: ResetPasswordInput): Promise<void> =>
  request<void>(API_PATH.resetPassword(role), { method: 'POST', body: input });
