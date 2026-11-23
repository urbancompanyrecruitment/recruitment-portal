import { Button, Card, Result } from 'antd';
import { UserRole } from '@/domain/interface';
import { useAuth, useSessionUser } from '@/shared/auth/session';
import { PublicShell } from '@/shared/components/PublicShell';
import { PENDING_APPROVAL } from '../constant';

export const PendingApprovalPage = () => {
  const recruiter = useSessionUser(UserRole.Recruiter);
  const { signOut } = useAuth();

  return (
    <PublicShell
      narrow
      actions={
        <>
          <span className="muted small">{recruiter.name}</span>
          <Button size="small" onClick={() => signOut(UserRole.Recruiter)}>
            {PENDING_APPROVAL.signOut}
          </Button>
        </>
      }
    >
      <Card>
        <Result status="info" title={PENDING_APPROVAL.message} />
      </Card>
    </PublicShell>
  );
};
