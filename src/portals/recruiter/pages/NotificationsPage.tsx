import { Button, Card, Empty, Flex, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '@/domain/format';
import { UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { PageHeader } from '@/shared/components/ui';
import { HubStatusTag } from '../components/HubStatusTag';
import { RECRUITER_PATH } from '../constant';
import { useJoiningSoon } from '../hooks';

export const NotificationsPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const { joiningSoon, isLoading } = useJoiningSoon(user.id);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Joining dates and UC hub updates for your assigned providers." />
      <Card loading={isLoading}>
        {joiningSoon.length ? (
          <Flex vertical>
            {joiningSoon.map(({ candidate, reservation }) => (
              <div key={candidate.id} className="recruiter-notification">
                <HubStatusTag hub={reservation.hub} />
                <Typography.Title level={5} style={{ margin: '10px 0 4px' }}>
                  {candidate.name} · Joining {formatDate(reservation.startDate)}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  {reservation.hub
                    ? `UC has assigned ${reservation.hub}. Review and share the stay-area instructions with the provider.`
                    : 'The joining date is within two weeks. UC has not yet assigned a hub.'}
                </Typography.Paragraph>
                <Link to={RECRUITER_PATH.candidate(candidate.id)}>View provider profile →</Link>
              </div>
            ))}
          </Flex>
        ) : (
          <Empty description="No upcoming hub updates">
            <Button type="primary" onClick={() => navigate(RECRUITER_PATH.myCandidates)}>
              View my candidates
            </Button>
          </Empty>
        )}
      </Card>
    </>
  );
};
