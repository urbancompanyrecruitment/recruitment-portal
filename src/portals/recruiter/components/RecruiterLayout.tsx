import { UserRole } from '@/domain/interface';
import { PortalShell } from '@/shared/components/PortalShell';
import { RECRUITER_NAV_ITEMS, RECRUITER_WORKSPACE } from '../constant';

export const RecruiterLayout = () => (
  <PortalShell
    role={UserRole.Recruiter}
    workspace={RECRUITER_WORKSPACE}
    navItems={RECRUITER_NAV_ITEMS}
    sidebarFooter={
      <>
        <div className="recruiter-approved">● Approved recruiter</div>
        <div>No credits in the initial phase.</div>
      </>
    }
  />
);
