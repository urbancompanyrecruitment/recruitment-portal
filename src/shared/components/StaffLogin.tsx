import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '@/api/auth';
import { APP_NAME } from '@/domain/constant';
import { DEMO_PASSWORD } from '@/mocks/constant';
import { useAuth } from '@/shared/auth/AuthProvider';
import { LoginFormValues, StaffLoginProps } from './interface';

export const StaffLogin = ({ role, title, subtitle, demoAccounts, hero }: StaffLoginProps) => {
  const [form] = Form.useForm<LoginFormValues>();
  const { signInAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useMutation({
    mutationFn: ({ loginId, password }: LoginFormValues) => signIn(role, loginId, password),
    onSuccess: user => {
      signInAs(user);
      navigate(location.state?.from ?? `/${role}`, { replace: true });
    },
  });

  return (
    <div className={hero ? 'staff-login' : 'staff-login staff-login-simple'}>
      {hero && <div className="staff-login-hero">{hero}</div>}
      <div className="staff-login-form">
        <section>
          <div className="brand" style={{ marginBottom: 28 }}>
            <span className="brand-logo">T</span>
            {APP_NAME}
          </div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>
            {title}
          </Typography.Title>
          <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
          <Card style={{ marginTop: 20 }}>
            <Form form={form} layout="vertical" requiredMark={false} onFinish={values => login.mutate(values)}>
              <Form.Item name="loginId" label="Login ID" rules={[{ required: true, message: 'Enter your login ID' }]}>
                <Input autoComplete="username" placeholder="Your login ID" />
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
              Explore with a sample account
            </Typography.Text>
            <Typography.Paragraph type="secondary" className="small" style={{ margin: '4px 0 10px' }}>
              Password for all sample accounts: <strong>{DEMO_PASSWORD}</strong>
            </Typography.Paragraph>
            <Flex gap={8} wrap>
              {demoAccounts.map(account => (
                <Button
                  key={account.loginId}
                  size="small"
                  onClick={() => form.setFieldsValue({ loginId: account.loginId, password: DEMO_PASSWORD })}
                >
                  {account.label}
                </Button>
              ))}
            </Flex>
          </div>
        </section>
      </div>
    </div>
  );
};
