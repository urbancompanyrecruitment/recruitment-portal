import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { signInAdmin } from '@/api/auth';
import { UserRole } from '@/domain/interface';
import { FORGOT_PASSWORD_PATH } from '@/shared/auth/constant';
import { useAuth } from '@/shared/auth/session';
import { LoginShell } from '@/shared/components/LoginShell';
import { FORGOT_PASSWORD } from '@/shared/passwordReset/constant';
import { ADMIN_LOGIN } from '../constant';
import { AdminLoginFormValues } from '../interface';

export const LoginPage = () => {
  const { signInAs } = useAuth();
  const login = useMutation({
    mutationFn: ({ email, password }: AdminLoginFormValues) => signInAdmin(email.trim().toLowerCase(), password),
    onSuccess: signInAs,
  });

  return (
    <LoginShell title={ADMIN_LOGIN.title} subtitle={ADMIN_LOGIN.subtitle}>
      <Card style={{ marginTop: 20 }}>
        <Form layout="vertical" requiredMark={false} onFinish={(values: AdminLoginFormValues) => login.mutate(values)}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: ADMIN_LOGIN.emailError }]}>
            <Input inputMode="email" autoComplete="email" placeholder="you@company.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: ADMIN_LOGIN.passwordError }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Typography.Paragraph className="small" style={{ margin: '-8px 0 16px', textAlign: 'right' }}>
            <Link to={FORGOT_PASSWORD_PATH[UserRole.Admin] ?? ''}>{FORGOT_PASSWORD.link}</Link>
          </Typography.Paragraph>
          {login.error && <Alert type="error" showIcon title={login.error.message} style={{ marginBottom: 16 }} />}
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            {ADMIN_LOGIN.submit}
          </Button>
        </Form>
      </Card>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
        {ADMIN_LOGIN.note}
      </Typography.Paragraph>
    </LoginShell>
  );
};
