import { UserRole } from '@/domain/interface';

export const SESSION_STORAGE_KEY = 'recruitment-portal-sessions';

export const REQUIRED_BUSINESS_ACCESSES: string[] = [];

export const LOGIN_PATH: Record<UserRole, string> = {
  [UserRole.Partner]: '/login',
  [UserRole.Recruiter]: '/recruiter/login',
  [UserRole.Business]: '/business/login',
};

export const ACCESS_DENIED = {
  title: 'No access to the recruitment dashboard',
  subtitle: 'Ask the business team to grant you access through the UC access-control dashboard, then sign in again.',
  signOut: 'Sign out',
};
