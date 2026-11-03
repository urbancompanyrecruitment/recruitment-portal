import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Flex, Spin, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '@/api/auth';
import { useAuth } from '@/shared/auth/AuthProvider';
import { GoogleSignIn } from '@/shared/components/GoogleSignIn';
import { LoginShell } from '@/shared/components/LoginShell';
import { BUSINESS_HOME_PATH, BUSINESS_LOGIN } from '../constant';

export const LoginPage = () => {
  const { signInAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: user => {
      signInAs(user);
      navigate(location.state?.from ?? BUSINESS_HOME_PATH, { replace: true });
    },
  });

  return (
    <LoginShell title={BUSINESS_LOGIN.title} subtitle={BUSINESS_LOGIN.subtitle}>
      <Card style={{ marginTop: 20 }}>
        <Flex vertical align="center" gap={16}>
          <GoogleSignIn onCredential={credential => login.mutate(credential)} />
          {login.isPending && <Spin />}
          {login.error && <Alert type="error" showIcon title={login.error.message} style={{ width: '100%' }} />}
          <Typography.Text type="secondary" className="small" style={{ textAlign: 'center' }}>
            {BUSINESS_LOGIN.note}
          </Typography.Text>
        </Flex>
      </Card>
    </LoginShell>
  );
};
