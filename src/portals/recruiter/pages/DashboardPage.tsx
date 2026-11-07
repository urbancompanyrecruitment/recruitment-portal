import { Button, Card, Col, Flex, Row, Tag, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { COOKING_FREQUENCY_LABEL } from '@/domain/constant';
import { ReservationStatus, UserRole } from '@/domain/interface';
import { formatLockStatus, getReservationStatus, isLockActive } from '@/domain/reservation';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, PageHeader, StatTile } from '@/shared/components/ui';
import { DASHBOARD_PREVIEW_COUNT, DASHBOARD_STATS, RECRUITER_PATH, WORKFLOW_STEPS } from '../constant';
import { useAvailableCandidates, useMyReservations, useOpenProfile } from '../hooks';
import { DashboardMetric } from '../interface';

export const DashboardPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const available = useAvailableCandidates();
  const mine = useMyReservations(user.id);
  const { openProfile, openingId } = useOpenProfile();

  const reservations = mine.data ?? [];
  const awaiting = reservations.filter(
    ({ reservation }) =>
      getReservationStatus(reservation) === ReservationStatus.AwaitingPlacement &&
      isLockActive(reservation, mine.dataUpdatedAt),
  );
  const placed = reservations.filter(({ reservation }) => getReservationStatus(reservation) === ReservationStatus.Placed);
  const preview = (available.data ?? []).slice(0, DASHBOARD_PREVIEW_COUNT);
  const isLoading = available.isLoading || mine.isLoading;
  const counts: Record<DashboardMetric, number> = {
    [DashboardMetric.Available]: available.data?.length ?? 0,
    [DashboardMetric.Awaiting]: awaiting.length,
    [DashboardMetric.Placed]: placed.length,
  };

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(' ')[0]}`}
        subtitle="Your recruitment pipeline, from first contact to placement."
        extra={
          <Button type="primary" onClick={() => navigate(RECRUITER_PATH.profiles)}>
            Browse verified profiles →
          </Button>
        }
      />
      <Row gutter={[18, 18]}>
        {DASHBOARD_STATS.map(stat => (
          <Col key={stat.metric} xs={24} sm={12} xl={8}>
            <StatTile label={stat.label} hint={stat.hint} to={stat.to} value={isLoading ? '—' : counts[stat.metric]} />
          </Col>
        ))}
      </Row>
      <Row gutter={[18, 18]} style={{ marginTop: 18 }}>
        <Col xs={24} lg={14}>
          <Flex vertical gap={18}>
            <Card
              title="Needs your attention"
              extra={<Link to={RECRUITER_PATH.myCandidates}>My candidates →</Link>}
              loading={mine.isLoading}
            >
              {awaiting.length ? (
                awaiting.map(({ candidate, reservation }) => (
                  <Flex key={candidate.id} align="center" gap={12} className="recruiter-row">
                    <CandidateAvatar name={candidate.name} size={38} />
                    <div className="recruiter-row-main">
                      <Typography.Text strong>{candidate.name}</Typography.Text>
                      <div className="muted small">Placement not saved</div>
                    </div>
                    <Tag color="warning">{formatLockStatus(reservation, mine.dataUpdatedAt)}</Tag>
                    <Link to={RECRUITER_PATH.candidate(candidate.id)}>Open profile →</Link>
                  </Flex>
                ))
              ) : (
                <Typography.Text type="secondary">You are up to date. No locked profiles are waiting for a placement.</Typography.Text>
              )}
            </Card>
            <Card
              title="Available professionals"
              extra={<Link to={RECRUITER_PATH.profiles}>View all →</Link>}
              loading={available.isLoading}
            >
              {preview.length ? (
                preview.map(candidate => (
                  <Flex key={candidate.id} align="center" gap={12} className="recruiter-row">
                    <CandidateAvatar name={candidate.name} size={38} />
                    <div className="recruiter-row-main">
                      <Typography.Text strong>{candidate.name}</Typography.Text>
                      <div className="muted small">
                        {candidate.city}, {candidate.country} · Cooking: {COOKING_FREQUENCY_LABEL[candidate.cookingFrequency]}
                      </div>
                    </div>
                    <Button type="link" loading={openingId === candidate.id} onClick={() => openProfile(candidate.id)}>
                      Open →
                    </Button>
                  </Flex>
                ))
              ) : (
                <Typography.Text type="secondary">No verified profiles are available right now.</Typography.Text>
              )}
            </Card>
          </Flex>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Your placement workflow">
            <Flex vertical gap={16}>
              {WORKFLOW_STEPS.map((step, index) => (
                <Flex key={step.title} gap={12} align="flex-start">
                  <span className="recruiter-step-number">{index + 1}</span>
                  <div>
                    <Typography.Text strong>{step.title}</Typography.Text>
                    <div className="muted small">{step.description}</div>
                  </div>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>
    </>
  );
};
