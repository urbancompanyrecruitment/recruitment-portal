import { App, Button, Card, Col, Flex, Popconfirm, Row, Tag, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { expireUnassignedReservations, resetMockData } from '@/api/reservations';
import { formatDate } from '@/domain/format';
import { ReservationStatus, UserRole } from '@/domain/interface';
import { formatTimeLeft, getReservationStatus } from '@/domain/reservation';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, Notice, PageHeader, StatTile } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { HubStatusTag } from '../components/HubStatusTag';
import {
  DASHBOARD_PREVIEW_COUNT,
  DASHBOARD_STATS,
  RECRUITER_MESSAGE,
  RECRUITER_PATH,
  WORKFLOW_STEPS,
} from '../constant';
import { useAvailableCandidates, useJoiningSoon, useMyReservations, useOpenProfile } from '../hooks';
import { DashboardMetric } from '../interface';

export const DashboardPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const { message } = App.useApp();
  const navigate = useNavigate();
  const available = useAvailableCandidates();
  const mine = useMyReservations(user.id);
  const { joiningSoon } = useJoiningSoon(user.id);
  const { openProfile, openingId } = useOpenProfile(user.id);
  const expire = useAppMutation<void, number>(() => expireUnassignedReservations(user.id));
  const reset = useAppMutation<void, void>(resetMockData, RECRUITER_MESSAGE.sampleReset);

  const reservations = mine.data ?? [];
  const awaiting = reservations.filter(
    ({ reservation }) => getReservationStatus(reservation) === ReservationStatus.AwaitingAggregator,
  );
  const preview = (available.data ?? []).slice(0, DASHBOARD_PREVIEW_COUNT);
  const isLoading = available.isLoading || mine.isLoading;
  const counts: Record<DashboardMetric, number> = {
    [DashboardMetric.Available]: available.data?.length ?? 0,
    [DashboardMetric.Awaiting]: awaiting.length,
    [DashboardMetric.Assigned]: reservations.length - awaiting.length,
    [DashboardMetric.JoiningSoon]: joiningSoon.length,
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
          <Col key={stat.metric} xs={24} sm={12} xl={6}>
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
                      <div className="muted small">Aggregator not assigned</div>
                    </div>
                    <Tag color="warning">{formatTimeLeft(reservation.deadlineAt, mine.dataUpdatedAt)}</Tag>
                    <Link to={RECRUITER_PATH.candidate(candidate.id)}>Open profile →</Link>
                  </Flex>
                ))
              ) : (
                <Typography.Text type="secondary">You are up to date. No unassigned reservations.</Typography.Text>
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
                        {candidate.city}, {candidate.country} · {candidate.category}
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
          <Flex vertical gap={18}>
            <Card title="Upcoming joining & hub updates" loading={mine.isLoading}>
              {joiningSoon.length ? (
                <Flex vertical gap={12}>
                  {joiningSoon.map(({ candidate, reservation }) => (
                    <div key={candidate.id} className="recruiter-soft-box">
                      <HubStatusTag hub={reservation.hub} />
                      <div className="recruiter-soft-box-title">
                        <Typography.Text strong>{candidate.name}</Typography.Text>
                      </div>
                      <div className="muted small">Joining {formatDate(reservation.startDate)}</div>
                      <Typography.Paragraph style={{ margin: '8px 0' }}>
                        {reservation.hub ?? 'UC will update the assigned area.'}
                      </Typography.Paragraph>
                      <Link to={RECRUITER_PATH.candidate(candidate.id)}>View instructions →</Link>
                    </div>
                  ))}
                </Flex>
              ) : (
                <Typography.Text type="secondary">No candidates joining in the next two weeks.</Typography.Text>
              )}
            </Card>
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
          </Flex>
        </Col>
      </Row>
      <Notice tone="warning" style={{ marginTop: 24, marginBottom: 0 }}>
        <Flex justify="space-between" align="center" gap={16} wrap>
          <div>
            <strong>Demo controls</strong>
            <div className="small">
              Simulate the reservation deadline passing, or restore the original sample data. Mock data only.
            </div>
          </div>
          <Flex gap={8} wrap>
            <Button
              loading={expire.isPending}
              onClick={() => expire.mutate(undefined, { onSuccess: count => message.info(RECRUITER_MESSAGE.released(count)) })}
            >
              Expire my unassigned reservations
            </Button>
            <Popconfirm title="Reset all mock data to the original sample?" onConfirm={() => reset.mutate()}>
              <Button loading={reset.isPending}>Reset sample data</Button>
            </Popconfirm>
          </Flex>
        </Flex>
      </Notice>
    </>
  );
};
