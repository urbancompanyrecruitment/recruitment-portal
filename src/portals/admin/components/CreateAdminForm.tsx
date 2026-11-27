import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminInput } from '@/api/interface';
import { createAdmin } from '@/api/people';
import { ADMIN_ROLE_OPTIONS } from '@/domain/constant';
import { AdminRole, UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { Notice } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { ADMIN_ACCOUNTS, ADMIN_HOME_PATH, ADMIN_MESSAGE } from '../constant';
import { TemporaryPasswordNotice } from '../interface';
import { TemporaryPasswordModal } from './TemporaryPasswordModal';

export const CreateAdminForm = () => {
  const [form] = Form.useForm<AdminInput>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const current = useSessionUser(UserRole.Admin);
  const addAdmin = useAppMutation(createAdmin, ADMIN_MESSAGE.adminCreated);

  if (current.adminRole !== AdminRole.SuperAdmin) return <Navigate to={ADMIN_HOME_PATH} replace />;

  return (
    <Card title={ADMIN_ACCOUNTS.createTitle}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ role: AdminRole.Admin }}
        onFinish={({ name, email, role }) =>
          addAdmin.mutate(
            { name: name.trim(), email: email.trim().toLowerCase(), role },
            {
              onSuccess: created => {
                form.resetFields();
                setNotice({ name: created.admin.name, account: created.admin.email, password: created.temporaryPassword });
              },
            },
          )
        }
      >
        <Row gutter={18}>
          <Col xs={24} md={8}>
            <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}>
              <Input placeholder="Full name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input inputMode="email" placeholder="name@company.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select options={ADMIN_ROLE_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>
        <Notice>{ADMIN_ACCOUNTS.createNote}</Notice>
        <Button type="primary" htmlType="submit" loading={addAdmin.isPending}>
          {ADMIN_ACCOUNTS.createAction}
        </Button>
      </Form>
      <TemporaryPasswordModal notice={notice} onClose={() => setNotice(undefined)} />
    </Card>
  );
};
