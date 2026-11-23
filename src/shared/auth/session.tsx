import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchCurrentUser, signOutRole } from '@/api/auth';
import { QUERY_KEY } from '@/api/constant';
import { SessionUser, UserRole } from '@/domain/interface';
import { LOGIN_PATH, SESSION_STALE_MS, SIGNED_OUT_PATH } from './constant';
import { RoleGuardProps, SignedOutOnlyProps } from './interface';

export const useSession = (role: UserRole) =>
  useQuery({
    queryKey: QUERY_KEY.currentUser(role),
    queryFn: () => fetchCurrentUser(role),
    staleTime: SESSION_STALE_MS,
    refetchOnWindowFocus: 'always',
  });

export const useSessionUser = (role: UserRole): SessionUser => {
  const user = useSession(role).data;

  if (!user) throw new Error(`No ${role} session`);

  return user;
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  return {
    signInAs: (user: SessionUser) => queryClient.setQueryData(QUERY_KEY.currentUser(user.role), user),
    signOut: async (role: UserRole) => {
      await signOutRole(role).catch(() => undefined);

      window.location.assign(SIGNED_OUT_PATH[role]);
    },
  };
};

export const SignedOutOnly = ({ role, to, children }: SignedOutOnlyProps) => {
  const session = useSession(role);
  const location = useLocation();

  if (session.isPending) return <Spin fullscreen />;

  if (session.data) return <Navigate to={location.state?.from ?? to} replace />;

  return <>{children}</>;
};

export const RequireRole = ({ role, children }: RoleGuardProps) => {
  const location = useLocation();
  const session = useSession(role);

  if (session.isPending) return <Spin fullscreen />;

  if (!session.data) return <Navigate to={LOGIN_PATH[role]} replace state={{ from: location.pathname }} />;

  return <>{children}</>;
};
