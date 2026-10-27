import { ReactNode } from 'react';
import { SessionUser, UserRole } from '@/domain/interface';

export type Sessions = Partial<Record<UserRole, SessionUser>>;

export interface AuthContextValue {
  sessions: Sessions;
  signInAs: (user: SessionUser) => void;
  signOut: (role: UserRole) => void;
}

export interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
}
