import { useQuery } from '@tanstack/react-query';
import { Button, Result, Spin } from 'antd';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchCurrentUser, signOutBusiness } from '@/api/auth';
import { QUERY_KEY, TOKEN_COOKIE } from '@/api/constant';
import { SessionUser, UserRole } from '@/domain/interface';
import { readCookie } from '@/shared/utils/cookie';
import { ACCESS_DENIED, REQUIRED_BUSINESS_ACCESSES, SESSION_STORAGE_KEY } from './constant';
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

  const signOut = (role: UserRole) => {
    if (role === UserRole.Business) signOutBusiness();

    setSessions(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== role)));
  };

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
  const { sessions, signInAs, signOut } = useAuth();
  const location = useLocation();
  const user = sessions[role];
  const canRestore = role === UserRole.Business && !user && Boolean(readCookie(TOKEN_COOKIE));
  const restored = useQuery({ queryKey: QUERY_KEY.currentUser, queryFn: fetchCurrentUser, enabled: canRestore });

  useEffect(() => {
    if (restored.data) signInAs(restored.data);
  }, [restored.data]);

  useEffect(() => {
    if (restored.error) signOut(role);
  }, [restored.error]);

  if (canRestore && !restored.error) return <Spin fullscreen />;

  if (!user) return <Navigate to={`/${role}/login`} replace state={{ from: location.pathname }} />;

  const hasAccess =
    role !== UserRole.Business ||
    !REQUIRED_BUSINESS_ACCESSES.length ||
    REQUIRED_BUSINESS_ACCESSES.some(access => user.accesses.includes(access));

  if (!hasAccess) {
    return (
      <Result
        status="403"
        title={ACCESS_DENIED.title}
        subTitle={ACCESS_DENIED.subtitle}
        extra={<Button onClick={() => signOut(role)}>{ACCESS_DENIED.signOut}</Button>}
      />
    );
  }

  return <>{children}</>;
};
