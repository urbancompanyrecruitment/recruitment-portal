import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SessionUser, UserRole } from '@/domain/interface';
import { SESSION_STORAGE_KEY } from './constant';
import { AuthContextValue, RoleGuardProps, Sessions } from './interface';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Sessions>(() =>
    JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? '{}'),
  );

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const signInAs = (user: SessionUser) => setSessions(current => ({ ...current, [user.role]: user }));
  const signOut = (role: UserRole) =>
    setSessions(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== role)));

  return <AuthContext.Provider value={{ sessions, signInAs, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const useSessionUser = (role: UserRole): SessionUser => {
  const user = useAuth().sessions[role];
  if (!user) throw new Error(`No ${role} session`);
  return user;
};

export const RequireRole = ({ role, children }: RoleGuardProps) => {
  const { sessions } = useAuth();
  const location = useLocation();
  if (!sessions[role]) return <Navigate to={`/${role}/login`} replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};
