import { UserRole } from '@/domain/interface';

export const SESSION_STALE_MS = 30_000;

export const HOME_PATH = '/';

export const PORTAL_PATH: Record<UserRole, string> = {
  [UserRole.Partner]: '/candidate',
  [UserRole.Recruiter]: '/recruiter',
  [UserRole.Admin]: '/admin',
};

export const LOGIN_PATH: Record<UserRole, string> = {
  [UserRole.Partner]: '/candidate/login',
  [UserRole.Recruiter]: '/recruiter/login',
  [UserRole.Admin]: '/admin/login',
};

export const FORGOT_PASSWORD_PATH: Partial<Record<UserRole, string>> = {
  [UserRole.Recruiter]: '/recruiter/forgot-password',
  [UserRole.Admin]: '/admin/forgot-password',
};

export const SIGNED_OUT_PATH: Record<UserRole, string> = {
  [UserRole.Partner]: PORTAL_PATH[UserRole.Partner],
  [UserRole.Recruiter]: PORTAL_PATH[UserRole.Recruiter],
  [UserRole.Admin]: LOGIN_PATH[UserRole.Admin],
};
