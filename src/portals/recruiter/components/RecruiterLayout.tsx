import { UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { PortalShell } from '@/shared/components/PortalShell';
import { RECRUITER_NAV_ITEMS, RECRUITER_PATH, RECRUITER_WORKSPACE } from '../constant';
import { useJoiningSoon } from '../hooks';

export const RecruiterLayout = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const { joiningSoon } = useJoiningSoon(user.id);
  const navItems = RECRUITER_NAV_ITEMS.map(item =>
    item.path === RECRUITER_PATH.notifications ? { ...item, badge: joiningSoon.length } : item,
  );

  return (
    <PortalShell
      role={UserRole.Recruiter}
      workspace={RECRUITER_WORKSPACE}
      navItems={navItems}
      sidebarFooter={
        <>
          <div className="recruiter-approved">● Approved recruiter</div>
          <div>No credits in the initial phase.</div>
        </>
      }
    />
  );
};
