import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Result } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/api/auth';
import { QUERY_KEY } from '@/api/constant';
import { PASSWORD_MIN_LENGTH } from '@/domain/constant';
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from '@/shared/auth/constant';
import { LoginShell } from '@/shared/components/LoginShell';
import { RESET_PASSWORD, RESET_TOKEN_PARAM } from './constant';
import { PasswordResetPageProps, ResetPasswordFormValues } from './interface';

export const ResetPasswordPage = ({ role }: PasswordResetPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get(RESET_TOKEN_PARAM) ?? '');

  useEffect(() => {
    if (location.hash) navigate(location.pathname, { replace: true });
  }, [location.hash, location.pathname, navigate]);

  const queryClient = useQueryClient();
  const reset = useMutation({
    mutationFn: (password: string) => resetPassword(role, { token, password }),
    onSuccess: () => queryClient.setQueryData(QUERY_KEY.currentUser(role), null),
  });
  const requestNewLink = (
    <Link to={FORGOT_PASSWORD_PATH[role] ?? LOGIN_PATH[role]}>
      <Button>{RESET_PASSWORD.requestNewLink}</Button>
    </Link>
  );

  if (reset.isSuccess) {
    return (
      <LoginShell title={RESET_PASSWORD.title} subtitle={RESET_PASSWORD.subtitle}>
        <Card style={{ marginTop: 20 }}>
          <Result
            status="success"
            title={RESET_PASSWORD.doneTitle}
            subTitle={RESET_PASSWORD.doneSubtitle}
            extra={
              <Link to={LOGIN_PATH[role]}>
                <Button type="primary">{RESET_PASSWORD.signIn}</Button>
              </Link>
            }
          />
        </Card>
      </LoginShell>
    );
  }

  return (
    <LoginShell title={RESET_PASSWORD.title} subtitle={RESET_PASSWORD.subtitle}>
      <Card style={{ marginTop: 20 }}>
        {token ? (
          <Form layout="vertical" requiredMark={false} onFinish={({ password }: ResetPasswordFormValues) => reset.mutate(password)}>
            <Form.Item
              name="password"
              label={RESET_PASSWORD.newLabel}
              rules={[{ required: true, min: PASSWORD_MIN_LENGTH, message: `Use at least ${PASSWORD_MIN_LENGTH} characters` }]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={RESET_PASSWORD.confirmLabel}
              dependencies={['password']}
              rules={[
                { required: true, message: RESET_PASSWORD.mismatch },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error(RESET_PASSWORD.mismatch)),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            {reset.error && (
              <Alert type="error" showIcon title={reset.error.message} action={requestNewLink} style={{ marginBottom: 16 }} />
            )}
            <Button type="primary" htmlType="submit" block loading={reset.isPending}>
              {RESET_PASSWORD.submit}
            </Button>
          </Form>
        ) : (
          <Alert type="warning" showIcon title={RESET_PASSWORD.missingToken} action={requestNewLink} />
        )}
      </Card>
    </LoginShell>
  );
};
