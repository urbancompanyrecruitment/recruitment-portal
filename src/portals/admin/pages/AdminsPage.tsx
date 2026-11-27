import { Button, Card, Flex, Popconfirm, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccounts } from '@/api/hooks';
import { resetAdminPassword, setAdminStatus } from '@/api/people';
import { ADMIN_ROLE_LABEL, ADMIN_ROLE_OPTIONS } from '@/domain/constant';
import { formatDateTime } from '@/domain/format';
import { AdminAccount, AdminRole, UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { TABLE_PAGINATION, TABLE_SCROLL } from '@/shared/components/constant';
import { FilterSelect, PageHeader, SearchBox } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { matchesSearch } from '@/shared/utils/search';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';
import {
  ADMIN_ACCOUNTS,
  ADMIN_HOME_PATH,
  ADMIN_MESSAGE,
  ADMIN_STATUS_ACTION,
  ADMIN_STATUS_FILTER_OPTIONS,
  ADMIN_STATUS_TAG,
  LAST_SIGN_IN,
  LIST_FILTER,
  RESET_PASSWORD,
} from '../constant';
import { AdminStatusVariables, AdminTableFilters, TemporaryPasswordNotice } from '../interface';

export const AdminsPage = () => {
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AdminTableFilters>({});
  const current = useSessionUser(UserRole.Admin);
  const isSuperAdmin = current.adminRole === AdminRole.SuperAdmin;
  const { data: admins = [], isLoading } = useAdminAccounts(isSuperAdmin);
  const changeStatus = useAppMutation(
    ({ admin, status }: AdminStatusVariables) => setAdminStatus(admin.id, status),
    ADMIN_MESSAGE.adminAccessUpdated,
  );
  const resetPassword = useAppMutation((admin: AdminAccount) => resetAdminPassword(admin.id), ADMIN_MESSAGE.passwordReset);

  if (!isSuperAdmin) return <Navigate to={ADMIN_HOME_PATH} replace />;

  const visibleAdmins = admins
    .filter(admin => (!filters.role || admin.role === filters.role) && (!filters.status || admin.status === filters.status))
    .filter(admin => matchesSearch(search, [admin.name, admin.email, ADMIN_ROLE_LABEL[admin.role]]));

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
      render: (_, admin) => (admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : LAST_SIGN_IN.never),
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
        <Card
          title={ADMIN_ACCOUNTS.listTitle}
          styles={{ body: { padding: 0 } }}
          extra={
            <Flex gap={12} wrap>
              <FilterSelect
                label={LIST_FILTER.adminRoleLabel}
                placeholder={LIST_FILTER.adminRolePlaceholder}
                value={filters.role}
                options={ADMIN_ROLE_OPTIONS}
                onChange={role => setFilters(current => ({ ...current, role }))}
              />
              <FilterSelect
                label={LIST_FILTER.adminStatusLabel}
                placeholder={LIST_FILTER.adminStatusPlaceholder}
                value={filters.status}
                options={ADMIN_STATUS_FILTER_OPTIONS}
                onChange={status => setFilters(current => ({ ...current, status }))}
              />
              <SearchBox value={search} onChange={setSearch} placeholder={ADMIN_ACCOUNTS.searchPlaceholder} label={ADMIN_ACCOUNTS.searchLabel} />
            </Flex>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={visibleAdmins}
            loading={isLoading}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            locale={{ emptyText: search.trim() || filters.role || filters.status ? ADMIN_ACCOUNTS.searchEmpty : ADMIN_ACCOUNTS.none }}
          />
        </Card>
      </Flex>
      <TemporaryPasswordModal notice={notice} onClose={() => setNotice(undefined)} />
    </>
  );
};
