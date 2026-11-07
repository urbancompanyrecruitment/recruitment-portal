import { UserOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Alert, Avatar, Button, Card, Flex, Form, Input, Tag, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInRecruiter } from '@/api/auth';
import { DEMO_PASSWORD } from '@/domain/constant';
import { useAuth } from '@/shared/auth/AuthProvider';
import { CANDIDATE_AVATAR_STYLE } from '@/shared/components/constant';
import { LoginShell } from '@/shared/components/LoginShell';
import { VerificationTag } from '@/shared/components/ui';
import { HERO_SKILL_TAGS, RECRUITER_DEMO_ACCOUNTS, RECRUITER_LOGIN, RECRUITER_PATH } from '../constant';
import { LoginFormValues } from '../interface';

export const LoginPage = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const { signInAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) => signInRecruiter(email, password),
    onSuccess: user => {
      signInAs(user);
      navigate(location.state?.from ?? RECRUITER_PATH.dashboard, { replace: true });
    },
  });

  return (
    <LoginShell
      title={RECRUITER_LOGIN.title}
      subtitle={RECRUITER_LOGIN.subtitle}
      hero={
        <div className="recruiter-hero">
          <span className="eyebrow">Approved recruiter access</span>
          <h1 className="recruiter-hero-title">The right people. The next opportunity.</h1>
          <Typography.Paragraph className="recruiter-hero-text">
            Discover UC-verified professionals and guide their next step, from first conversation to placement.
          </Typography.Paragraph>
          <div className="recruiter-hero-card">
            <Flex justify="space-between" align="center" gap={12}>
              <span className="eyebrow">Verified talent network</span>
              <VerificationTag verified />
            </Flex>
            <Flex align="center" gap={14} style={{ margin: '20px 0 18px' }}>
              <Avatar size={52} icon={<UserOutlined />} style={CANDIDATE_AVATAR_STYLE} />
              <div>
                <Typography.Text strong>Ready for a new opportunity</Typography.Text>
                <div className="muted small">Assessed. Verified. Ready to connect.</div>
              </div>
            </Flex>
            <Flex gap={6} wrap>
              {HERO_SKILL_TAGS.map(skill => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </Flex>
          </div>
        </div>
      }
    >
      <Card style={{ marginTop: 20 }}>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={values => login.mutate(values)}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter your email' }]}>
            <Input autoComplete="email" placeholder="you@agency.sg" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password autoComplete="current-password" placeholder="Your password" />
          </Form.Item>
          {login.error && <Alert type="error" title={login.error.message} style={{ marginBottom: 16 }} showIcon />}
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            Sign in →
          </Button>
        </Form>
      </Card>
      <div className="demo-accounts">
        <Typography.Text strong className="small">
          {RECRUITER_LOGIN.demoHeading}
        </Typography.Text>
        <Typography.Paragraph type="secondary" className="small" style={{ margin: '4px 0 10px' }}>
          {RECRUITER_LOGIN.demoPasswordNote} <strong>{DEMO_PASSWORD}</strong>
        </Typography.Paragraph>
        <Flex gap={8} wrap>
          {RECRUITER_DEMO_ACCOUNTS.map(account => (
            <Button
              key={account.email}
              size="small"
              onClick={() => form.setFieldsValue({ email: account.email, password: DEMO_PASSWORD })}
            >
              {account.label}
            </Button>
          ))}
        </Flex>
        <Typography.Paragraph type="secondary" className="small" style={{ margin: '12px 0 0' }}>
          {RECRUITER_LOGIN.accountNote}
        </Typography.Paragraph>
      </div>
    </LoginShell>
  );
};
