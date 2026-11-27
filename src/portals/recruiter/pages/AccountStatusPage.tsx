import { Button, Card, Result } from 'antd';
import { RecruiterStatus, UserRole } from '@/domain/interface';
import { useAuth, useSessionUser } from '@/shared/auth/session';
import { PublicShell } from '@/shared/components/PublicShell';
import { ACCOUNT_STATUS_COPY, ACCOUNT_STATUS_SIGN_OUT } from '../constant';

export const AccountStatusPage = () => {
  const recruiter = useSessionUser(UserRole.Recruiter);
  const { signOut } = useAuth();
  const copy = ACCOUNT_STATUS_COPY[recruiter.recruiterStatus ?? RecruiterStatus.Pending] ?? ACCOUNT_STATUS_COPY[RecruiterStatus.Pending];

  return (
    <PublicShell
      narrow
      actions={
        <>
          <span className="muted small">{recruiter.name}</span>
          <Button size="small" onClick={() => signOut(UserRole.Recruiter)}>
            {ACCOUNT_STATUS_SIGN_OUT}
          </Button>
        </>
      }
    >
      <Card>
        {copy && <Result status={copy.status} title={copy.title} subTitle={copy.message} />}
      </Card>
    </PublicShell>
  );
};
