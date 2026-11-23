import { UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/session';
import { ChangePassword } from '@/shared/components/ChangePassword';
import { PortalShell } from '@/shared/components/PortalShell';
import { RECRUITER_NAV_ITEMS, RECRUITER_WORKSPACE } from '../constant';
import { PendingApprovalPage } from '../pages/PendingApprovalPage';

export const RecruiterLayout = () => {
  const recruiter = useSessionUser(UserRole.Recruiter);

  if (!recruiter.approved) return <PendingApprovalPage />;

  return (
    <PortalShell
      role={UserRole.Recruiter}
      workspace={RECRUITER_WORKSPACE}
      navItems={RECRUITER_NAV_ITEMS}
      headerExtra={<ChangePassword role={UserRole.Recruiter} />}
      sidebarFooter={
        <>
          <div className="recruiter-approved">● Approved recruiter</div>
          <div>No credits in the initial phase.</div>
        </>
      }
    />
  );
};
