import { Button, Card, Empty, Flex, Table, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAggregators } from '@/api/hooks';
import { ReservedCandidate } from '@/api/interface';
import { formatDate } from '@/domain/format';
import { ReservationStatus, UserRole } from '@/domain/interface';
import { formatLockStatus, getReservationStatus } from '@/domain/reservation';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, PageHeader } from '@/shared/components/ui';
import { CANDIDATE_TABS, RECRUITER_PATH } from '../constant';
import { useMyReservations } from '../hooks';
import { CandidateTab } from '../interface';

export const MyCandidatesPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const { data = [], isLoading, dataUpdatedAt } = useMyReservations(user.id);
  const aggregators = useAggregators();
  const [activeTab, setActiveTab] = useState<CandidateTab>(CandidateTab.All);

  const rowsByTab = Object.fromEntries(
    CANDIDATE_TABS.map(tab => [
      tab.key,
      data.filter(({ reservation }) => !tab.status || getReservationStatus(reservation) === tab.status),
    ]),
  ) as Record<CandidateTab, ReservedCandidate[]>;

  return (
    <>
      <PageHeader title="My candidates" subtitle="Manage your locked profiles and confirmed aggregator placements." />
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as CandidateTab)}
        items={CANDIDATE_TABS.map(tab => ({
          key: tab.key,
          label: `${tab.label} (${rowsByTab[tab.key].length})`,
        }))}
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table<ReservedCandidate>
          rowKey={row => row.candidate.id}
          loading={isLoading}
          dataSource={rowsByTab[activeTab]}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <Empty description="No candidates here yet">
                <Button type="primary" onClick={() => navigate(RECRUITER_PATH.profiles)}>
                  Browse profiles
                </Button>
              </Empty>
            ),
          }}
          columns={[
            {
              key: 'professional',
              title: 'Professional',
              render: (_, { candidate }) => (
                <Flex align="center" gap={12}>
                  <CandidateAvatar name={candidate.name} size={36} />
                  <div>
                    <Typography.Text strong>{candidate.name}</Typography.Text>
                    <div className="muted small">{candidate.category}</div>
                  </div>
                </Flex>
              ),
            },
            {
              key: 'location',
              title: 'Current location',
              render: (_, { candidate }) => `${candidate.city}, ${candidate.country}`,
            },
            {
              key: 'startDate',
              title: 'Start date',
              render: (_, { reservation }) => formatDate(reservation.startDate),
            },
            {
              key: 'aggregator',
              title: 'Aggregator',
              render: (_, { reservation }) =>
                aggregators.data?.find(aggregator => aggregator.id === reservation.aggregatorId)?.name ?? (
                  <Typography.Text type="secondary">Not assigned</Typography.Text>
                ),
            },
            {
              key: 'status',
              title: 'Status',
              render: (_, { reservation }) =>
                getReservationStatus(reservation) === ReservationStatus.AggregatorAssigned ? (
                  <Tag color="success">Assigned</Tag>
                ) : (
                  <Tag color="warning">{formatLockStatus(reservation, dataUpdatedAt)}</Tag>
                ),
            },
            {
              key: 'view',
              title: '',
              align: 'right',
              render: (_, { candidate }) => <Link to={RECRUITER_PATH.candidate(candidate.id)}>View →</Link>,
            },
          ]}
        />
      </Card>
    </>
  );
};
