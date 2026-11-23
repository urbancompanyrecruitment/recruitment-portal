import { ReactNode } from 'react';
import { SessionUser, UserRole } from '@/domain/interface';

export type Sessions = Partial<Record<UserRole, SessionUser | null>>;

export interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
}

export interface SignedOutOnlyProps extends RoleGuardProps {
  to: string;
}
