import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { signInRecruiter } from '@/api/auth';
import { UserRole } from '@/domain/interface';
import { FORGOT_PASSWORD_PATH } from '@/shared/auth/constant';
import { useAuth } from '@/shared/auth/session';
import { LoginShell } from '@/shared/components/LoginShell';
import { FORGOT_PASSWORD } from '@/shared/passwordReset/constant';
import { RecruiterHero } from '../components/RecruiterHero';
import { RECRUITER_LOGIN, RECRUITER_PATH } from '../constant';
import { LoginFormValues } from '../interface';

export const LoginPage = () => {
  const { signInAs } = useAuth();
  const login = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) => signInRecruiter(email, password),
    onSuccess: signInAs,
  });

  return (
    <LoginShell title={RECRUITER_LOGIN.title} subtitle={RECRUITER_LOGIN.subtitle} hero={<RecruiterHero />}>
      <Card style={{ marginTop: 20 }}>
        <Form layout="vertical" requiredMark={false} onFinish={(values: LoginFormValues) => login.mutate(values)}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter your email' }]}>
            <Input autoComplete="email" placeholder="you@agency.sg" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password autoComplete="current-password" placeholder="Your password" />
          </Form.Item>
          <Typography.Paragraph className="small" style={{ margin: '-8px 0 16px', textAlign: 'right' }}>
            <Link to={FORGOT_PASSWORD_PATH[UserRole.Recruiter] ?? ''}>{FORGOT_PASSWORD.link}</Link>
          </Typography.Paragraph>
          {login.error && <Alert type="error" title={login.error.message} style={{ marginBottom: 16 }} showIcon />}
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            Sign in →
          </Button>
        </Form>
      </Card>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
        {RECRUITER_LOGIN.signUpPrompt} <Link to={RECRUITER_PATH.signUp}>{RECRUITER_LOGIN.signUpLink}</Link>
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '8px 0 0' }}>
        {RECRUITER_LOGIN.accountNote}
      </Typography.Paragraph>
    </LoginShell>
  );
};
