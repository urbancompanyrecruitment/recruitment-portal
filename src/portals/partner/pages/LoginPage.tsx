import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { signInPartner } from '@/api/auth';
import { PHONE_PATTERN } from '@/domain/constant';
import { useAuth } from '@/shared/auth/session';
import { PageHeader } from '@/shared/components/ui';
import { PRIMARY_PHONE_ERROR } from '@/shared/registration/constant';
import { PARTNER_LOGIN, PARTNER_ROUTE } from '../constant';
import { PartnerLoginFormValues } from '../interface';

export const LoginPage = () => {
  const { signInAs } = useAuth();
  const login = useMutation({
    mutationFn: ({ primaryPhone, lastName }: PartnerLoginFormValues) => signInPartner(primaryPhone.trim(), lastName.trim()),
    onSuccess: signInAs,
  });

  return (
    <div className="partner-narrow">
      <PageHeader title={PARTNER_LOGIN.title} subtitle={PARTNER_LOGIN.subtitle} />
      <Card>
        <Form layout="vertical" requiredMark={false} onFinish={values => login.mutate(values)}>
          <Form.Item
            name="primaryPhone"
            label={PARTNER_LOGIN.phoneLabel}
            rules={[{ required: true, pattern: PHONE_PATTERN, message: PRIMARY_PHONE_ERROR }]}
          >
            <Input type="tel" autoComplete="tel" placeholder="+65 9123 4567" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={PARTNER_LOGIN.lastNameLabel}
            rules={[{ required: true, whitespace: true, message: PARTNER_LOGIN.lastNameError }]}
          >
            <Input autoComplete="family-name" />
          </Form.Item>
          {login.error && <Alert type="error" title={login.error.message} style={{ marginBottom: 16 }} showIcon />}
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            {PARTNER_LOGIN.submit}
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
          {PARTNER_LOGIN.registerPrompt} <Link to={PARTNER_ROUTE.registration}>{PARTNER_LOGIN.registerLink}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};
