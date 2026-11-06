import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { signInPartner } from '@/api/auth';
import { PHONE_PATTERN } from '@/domain/constant';
import { DEMO_PASSWORD } from '@/mocks/constant';
import { useAuth } from '@/shared/auth/AuthProvider';
import { PageHeader } from '@/shared/components/ui';
import { PARTNER_LOGIN, PARTNER_ROUTE, PRIMARY_PHONE_ERROR } from '../constant';
import { PartnerLoginFormValues } from '../interface';

export const LoginPage = () => {
  const { signInAs } = useAuth();
  const navigate = useNavigate();
  const login = useMutation({
    mutationFn: ({ primaryPhone, password }: PartnerLoginFormValues) => signInPartner(primaryPhone, password),
    onSuccess: user => {
      signInAs(user);
      navigate(PARTNER_ROUTE.status, { replace: true });
    },
  });

  return (
    <div className="partner-narrow">
      <PageHeader title={PARTNER_LOGIN.title} subtitle={PARTNER_LOGIN.subtitle} />
      <Card>
        <Form layout="vertical" requiredMark={false} onFinish={values => login.mutate(values)}>
          <Form.Item
            name="primaryPhone"
            label={PARTNER_LOGIN.phoneLabel}
            rules={[{ required: true, message: PRIMARY_PHONE_ERROR }, { pattern: PHONE_PATTERN, message: PRIMARY_PHONE_ERROR }]}
          >
            <Input type="tel" autoComplete="tel" placeholder="+95 9123 4567" />
          </Form.Item>
          <Form.Item
            name="password"
            label={PARTNER_LOGIN.passwordLabel}
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          {login.error && <Alert type="error" title={login.error.message} style={{ marginBottom: 16 }} showIcon />}
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            {PARTNER_LOGIN.submit}
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
          {PARTNER_LOGIN.registerPrompt} <Link to={PARTNER_ROUTE.registration}>{PARTNER_LOGIN.registerLink}</Link>
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" className="small" style={{ margin: '8px 0 0' }}>
          {PARTNER_LOGIN.demoNote} <strong>{DEMO_PASSWORD}</strong>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};
