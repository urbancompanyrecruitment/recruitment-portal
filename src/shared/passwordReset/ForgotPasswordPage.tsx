import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Result, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '@/api/auth';
import { LOGIN_PATH } from '@/shared/auth/constant';
import { LoginShell } from '@/shared/components/LoginShell';
import { FORGOT_PASSWORD } from './constant';
import { ForgotPasswordFormValues, PasswordResetPageProps } from './interface';

export const ForgotPasswordPage = ({ role }: PasswordResetPageProps) => {
  const request = useMutation({ mutationFn: (email: string) => requestPasswordReset(role, email) });

  return (
    <LoginShell title={FORGOT_PASSWORD.title} subtitle={FORGOT_PASSWORD.subtitle}>
      <Card style={{ marginTop: 20 }}>
        {request.isSuccess ? (
          <Result status="success" title={FORGOT_PASSWORD.sentTitle} subTitle={FORGOT_PASSWORD.sentSubtitle(request.variables)} />
        ) : (
          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={({ email }: ForgotPasswordFormValues) => request.mutate(email.trim().toLowerCase())}
          >
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: FORGOT_PASSWORD.emailError }]}>
              <Input inputMode="email" autoComplete="email" />
            </Form.Item>
            {request.error && <Alert type="error" showIcon title={request.error.message} style={{ marginBottom: 16 }} />}
            <Button type="primary" htmlType="submit" block loading={request.isPending}>
              {FORGOT_PASSWORD.submit}
            </Button>
          </Form>
        )}
      </Card>
      <Typography.Paragraph className="small" style={{ margin: '16px 0 0' }}>
        <Link to={LOGIN_PATH[role]}>{FORGOT_PASSWORD.backToSignIn}</Link>
      </Typography.Paragraph>
    </LoginShell>
  );
};
