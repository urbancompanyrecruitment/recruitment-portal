import { Avatar, Badge, Button, Flex, Layout, Menu, Tag, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/domain/constant';
import { getInitials } from '@/domain/format';
import { useAuth, useSessionUser } from '@/shared/auth/AuthProvider';
import { COLOR } from '@/theme/constant';
import { CANDIDATE_AVATAR_STYLE } from './constant';
import { PortalShellProps } from './interface';

export const PortalShell = ({ role, workspace, navItems, sidebarFooter }: PortalShellProps) => {
  const user = useSessionUser(role);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeItem = navItems.find(item => location.pathname.startsWith(item.path));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={232} className="portal-sider" breakpoint="md" collapsedWidth={0}>
        <Link to={navItems[0].path} className="brand">
          <span className="brand-logo">T</span>
          {APP_NAME}
        </Link>
        <div className="workspace-label">{workspace}</div>
        <Menu
          mode="inline"
          selectedKeys={activeItem ? [activeItem.path] : []}
          items={navItems.map(item => ({
            key: item.path,
            label: (
              <Link to={item.path}>
                <Flex justify="space-between" align="center">
                  {item.label}
                  {item.badge ? <Badge count={item.badge} size="small" color={COLOR.primary} /> : null}
                </Flex>
              </Link>
            ),
          }))}
        />
        {sidebarFooter && <div className="portal-sider-footer">{sidebarFooter}</div>}
      </Layout.Sider>
      <Layout>
        <Layout.Header className="portal-header">
          <Typography.Text type="secondary" className="small">
            {workspace} / {activeItem?.label ?? 'Details'}
          </Typography.Text>
          <Flex align="center" gap={12}>
            <Tag>{user.subtitle}</Tag>
            <Avatar style={CANDIDATE_AVATAR_STYLE}>{getInitials(user.name)}</Avatar>
            <Typography.Text strong>{user.name}</Typography.Text>
            <Button
              type="text"
              onClick={() => {
                signOut(role);
                navigate(`/${role}/login`);
              }}
            >
              Sign out
            </Button>
          </Flex>
        </Layout.Header>
        <Layout.Content className="portal-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
