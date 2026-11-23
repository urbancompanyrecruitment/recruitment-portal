import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { signUpRecruiter } from '@/api/auth';
import { PASSWORD_MIN_LENGTH, TERMS } from '@/domain/constant';
import { useAuth } from '@/shared/auth/session';
import { LoginShell } from '@/shared/components/LoginShell';
import { RecruiterHero } from '../components/RecruiterHero';
import { RECRUITER_PATH, RECRUITER_SIGN_UP } from '../constant';
import { SignUpFormValues } from '../interface';

export const SignUpPage = () => {
  const { signInAs } = useAuth();
  const signUp = useMutation({
    mutationFn: ({ name, company, email, password }: SignUpFormValues) =>
      signUpRecruiter({ name: name.trim(), company: company.trim(), email: email.trim().toLowerCase(), password }),
    onSuccess: signInAs,
  });

  return (
    <LoginShell title={RECRUITER_SIGN_UP.title} subtitle={RECRUITER_SIGN_UP.subtitle} hero={<RecruiterHero />}>
      <Card style={{ marginTop: 20 }}>
        <Form layout="vertical" requiredMark={false} onFinish={(values: SignUpFormValues) => signUp.mutate(values)}>
          <Form.Item name="name" label="Your name" rules={[{ required: true, whitespace: true, message: 'Enter your name' }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="company"
            label="Organisation"
            rules={[{ required: true, whitespace: true, message: 'Enter your organisation' }]}
          >
            <Input autoComplete="organization" placeholder="Recruitment agency" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input inputMode="email" autoComplete="email" placeholder="you@agency.sg" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: PASSWORD_MIN_LENGTH, message: `Use at least ${PASSWORD_MIN_LENGTH} characters` }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: RECRUITER_SIGN_UP.mismatch },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue('password')
                    ? Promise.resolve()
                    : Promise.reject(new Error(RECRUITER_SIGN_UP.mismatch)),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          {signUp.error && <Alert type="error" title={signUp.error.message} style={{ marginBottom: 16 }} showIcon />}
          <Typography.Paragraph type="secondary" className="small">
            {RECRUITER_SIGN_UP.termsNote}{' '}
            <a href={TERMS.recruiterPdf} target="_blank" rel="noreferrer">
              {TERMS.label}
            </a>
            .
          </Typography.Paragraph>
          <Button type="primary" htmlType="submit" block loading={signUp.isPending}>
            {RECRUITER_SIGN_UP.submit}
          </Button>
        </Form>
      </Card>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
        {RECRUITER_SIGN_UP.approvalNote}
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary" className="small" style={{ margin: '8px 0 0' }}>
        {RECRUITER_SIGN_UP.loginPrompt} <Link to={RECRUITER_PATH.login}>{RECRUITER_SIGN_UP.loginLink}</Link>
      </Typography.Paragraph>
    </LoginShell>
  );
};
