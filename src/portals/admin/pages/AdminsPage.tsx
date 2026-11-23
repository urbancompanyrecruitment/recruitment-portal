import { Button, Card, Col, Flex, Form, Input, Popconfirm, Row, Select, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccounts } from '@/api/hooks';
import { AdminInput } from '@/api/interface';
import { createAdmin, resetAdminPassword, setAdminStatus } from '@/api/people';
import { ADMIN_ROLE_LABEL, ADMIN_ROLE_OPTIONS } from '@/domain/constant';
import { formatDateTime } from '@/domain/format';
import { AdminAccount, AdminRole, UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';
import {
  ADMIN_ACCOUNTS,
  ADMIN_HOME_PATH,
  ADMIN_MESSAGE,
  ADMIN_STATUS_ACTION,
  ADMIN_STATUS_TAG,
  NEVER_SIGNED_IN,
  RESET_PASSWORD,
  TABLE_PAGE_SIZE,
} from '../constant';
import { AdminStatusVariables, TemporaryPasswordNotice } from '../interface';

export const AdminsPage = () => {
  const [form] = Form.useForm<AdminInput>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const current = useSessionUser(UserRole.Admin);
  const isSuperAdmin = current.adminRole === AdminRole.SuperAdmin;
  const { data: admins = [], isLoading } = useAdminAccounts(isSuperAdmin);
  const addAdmin = useAppMutation(createAdmin, ADMIN_MESSAGE.adminCreated);
  const changeStatus = useAppMutation(
    ({ admin, status }: AdminStatusVariables) => setAdminStatus(admin.id, status),
    ADMIN_MESSAGE.adminAccessUpdated,
  );
  const resetPassword = useAppMutation((admin: AdminAccount) => resetAdminPassword(admin.id), ADMIN_MESSAGE.passwordReset);

  if (!isSuperAdmin) return <Navigate to={ADMIN_HOME_PATH} replace />;

  const columns: TableColumnsType<AdminAccount> = [
    {
      title: 'Admin',
      key: 'admin',
      render: (_, admin) => (
        <>
          <Typography.Text strong>{admin.name}</Typography.Text>
          {admin.id === current.id && <Tag style={{ marginLeft: 8 }}>{ADMIN_ACCOUNTS.ownAccount}</Tag>}
          <div className="muted small">{admin.email}</div>
        </>
      ),
    },
    { title: 'Role', key: 'role', render: (_, admin) => ADMIN_ROLE_LABEL[admin.role] },
    {
      title: 'Status',
      key: 'status',
      render: (_, admin) => <Tag color={ADMIN_STATUS_TAG[admin.status].color}>{ADMIN_STATUS_TAG[admin.status].label}</Tag>,
    },
    {
      title: 'Last sign-in',
      key: 'lastLoginAt',
      render: (_, admin) => (admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : NEVER_SIGNED_IN),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      render: (_, admin) => {
        const action = ADMIN_STATUS_ACTION[admin.status];

        if (admin.id === current.id) return null;

        return (
          <Flex gap={8} justify="flex-end">
            <Popconfirm
              title={RESET_PASSWORD.confirmTitle(admin.name)}
              description={RESET_PASSWORD.confirmNote}
              okText={RESET_PASSWORD.action}
              placement="topRight"
              onConfirm={() =>
                resetPassword.mutate(admin, {
                  onSuccess: result => setNotice({ name: admin.name, account: admin.email, password: result.temporaryPassword }),
                })
              }
            >
              <Button
                size="small"
                aria-label={`${RESET_PASSWORD.action} for ${admin.name}`}
                loading={resetPassword.isPending && resetPassword.variables?.id === admin.id}
              >
                {RESET_PASSWORD.action}
              </Button>
            </Popconfirm>
            <Button
              size="small"
              danger={action.danger}
              aria-label={`${action.label} ${admin.name}`}
              loading={changeStatus.isPending && changeStatus.variables?.admin.id === admin.id}
              onClick={() => changeStatus.mutate({ admin, status: action.next })}
            >
              {action.label}
            </Button>
          </Flex>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader title={ADMIN_ACCOUNTS.title} subtitle={ADMIN_ACCOUNTS.subtitle} />
      <Flex vertical gap={18}>
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
                  <Input inputMode="email" placeholder="name@urbancompany.com" />
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
        </Card>

        <Card title={ADMIN_ACCOUNTS.listTitle} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={admins}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: ADMIN_ACCOUNTS.none }}
          />
        </Card>
      </Flex>
      <TemporaryPasswordModal notice={notice} onClose={() => setNotice(undefined)} />
    </>
  );
};
