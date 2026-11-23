import { Link } from 'react-router-dom';
import { AdminRole, UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { ChangePassword } from '@/shared/components/ChangePassword';
import { PortalShell } from '@/shared/components/PortalShell';
import { ADMIN_ACCOUNTS_NAV_ITEM, ADMIN_NAV_ITEMS, ADMIN_WORKSPACE, SIDEBAR_FOOTER } from '../constant';

export const AdminLayout = () => {
  const admin = useSessionUser(UserRole.Admin);
  const navItems = admin.adminRole === AdminRole.SuperAdmin ? [...ADMIN_NAV_ITEMS, ADMIN_ACCOUNTS_NAV_ITEM] : ADMIN_NAV_ITEMS;

  return (
    <PortalShell
      role={UserRole.Admin}
      workspace={ADMIN_WORKSPACE}
      navItems={navItems}
      headerExtra={<ChangePassword role={UserRole.Admin} />}
      sidebarFooter={
        <Link to={SIDEBAR_FOOTER.directoryPath} className="admin-footer-link">
          {SIDEBAR_FOOTER.directoryLabel}
        </Link>
      }
    />
  );
};
