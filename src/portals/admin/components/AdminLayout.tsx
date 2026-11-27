import { Link, NavLink } from 'react-router-dom';
import { AdminRole, UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { ChangePassword } from '@/shared/components/ChangePassword';
import { PortalShell } from '@/shared/components/PortalShell';
import {
  ADMIN_ACCOUNTS_NAV_ITEM,
  ADMIN_NAV_ITEMS,
  ADMIN_TOOL_GROUPS,
  ADMIN_TOOLS,
  ADMIN_WORKSPACE,
  adminToolPath,
  SIDEBAR_FOOTER,
} from '../constant';

export const AdminLayout = () => {
  const admin = useSessionUser(UserRole.Admin);
  const isSuperAdmin = admin.adminRole === AdminRole.SuperAdmin;
  const navItems = isSuperAdmin ? [...ADMIN_NAV_ITEMS, ADMIN_ACCOUNTS_NAV_ITEM] : ADMIN_NAV_ITEMS;
  const toolGroups = ADMIN_TOOL_GROUPS.map(group => ({
    ...group,
    tools: group.tools.filter(tool => isSuperAdmin || !ADMIN_TOOLS[tool].superAdminOnly),
  })).filter(group => group.tools.length);

  return (
    <PortalShell
      role={UserRole.Admin}
      workspace={ADMIN_WORKSPACE}
      navItems={navItems}
      crumbItems={toolGroups.flatMap(group => group.tools.map(tool => ({ path: adminToolPath(tool), label: ADMIN_TOOLS[tool].label })))}
      headerExtra={<ChangePassword role={UserRole.Admin} />}
      sidebarFooter={
        <>
          {toolGroups.map(group => (
            <nav key={group.title} className="admin-tool-group" aria-label={group.title}>
              <div className="admin-tool-group-title">{group.title}</div>
              {group.tools.map(tool => (
                <NavLink key={tool} to={adminToolPath(tool)} className="admin-tool-link">
                  {ADMIN_TOOLS[tool].label}
                </NavLink>
              ))}
            </nav>
          ))}
          <Link to={SIDEBAR_FOOTER.directoryPath} className="admin-footer-link">
            {SIDEBAR_FOOTER.directoryLabel}
          </Link>
        </>
      }
    />
  );
};
