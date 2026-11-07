import { Card, Flex, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useReservations } from '@/api/hooks';
import { formatDate, formatDateTime } from '@/domain/format';
import { AdminReservation } from '@/domain/interface';
import { Notice, PageHeader } from '@/shared/components/ui';
import { EMPTY_VALUE, INACTIVE_REASON_LABEL, LOCK_EXPIRY_NOTE, LOCK_STATE_TAG, RELEASED_REASONS, TABLE_PAGE_SIZE } from '../constant';

export const PlacementsPage = () => {
  const { data: reservations = [], isLoading } = useReservations();
  const released = reservations.filter(lock => lock.inactiveReason && RELEASED_REASONS.includes(lock.inactiveReason));

  const lockColumns: TableColumnsType<AdminReservation> = [
    {
      title: 'Provider',
      key: 'provider',
      render: (_, lock) => <Typography.Text strong>{lock.candidateName}</Typography.Text>,
    },
    {
      title: 'Locked by',
      key: 'lockedBy',
      render: (_, lock) => (
        <>
          <div>{lock.recruiterName}</div>
          <div className="muted small">{lock.recruiterCompany}</div>
        </>
      ),
    },
    { title: 'Locked at', key: 'lockedAt', render: (_, lock) => formatDateTime(lock.lockedAt) },
    { title: 'Release at', key: 'lockReleaseAt', render: (_, lock) => formatDateTime(lock.lockReleaseAt) },
    {
      title: 'State',
      key: 'state',
      render: (_, lock) => (
        <>
          <Tag color={LOCK_STATE_TAG[lock.state].color}>{LOCK_STATE_TAG[lock.state].label}</Tag>
          {lock.inactiveReason && <div className="muted small">{INACTIVE_REASON_LABEL[lock.inactiveReason]}</div>}
        </>
      ),
    },
    {
      title: 'Employer',
      key: 'employer',
      render: (_, lock) => lock.employerName ?? <span className="muted">Not saved</span>,
    },
    { title: 'Start date', key: 'startDate', render: (_, lock) => formatDate(lock.startDate) },
  ];

  const releasedColumns: TableColumnsType<AdminReservation> = [
    { title: 'Provider', dataIndex: 'candidateName', key: 'candidate' },
    { title: 'Recruiter', dataIndex: 'recruiterName', key: 'recruiter' },
    {
      title: 'Released at',
      key: 'at',
      render: (_, lock) => (lock.inactiveAt ? formatDateTime(lock.inactiveAt) : EMPTY_VALUE),
    },
    {
      title: 'Reason',
      key: 'reason',
      render: (_, lock) => (lock.inactiveReason ? INACTIVE_REASON_LABEL[lock.inactiveReason] : EMPTY_VALUE),
    },
  ];

  return (
    <>
      <PageHeader
        title="Locks & placements"
        subtitle="See which recruiter holds each partner and the placements they saved."
      />
      <Flex vertical gap={18}>
        <Card title="Recruiter locks" styles={{ body: { padding: 0 } }}>
          <Notice style={{ margin: 16 }}>{LOCK_EXPIRY_NOTE}</Notice>
          <Table
            rowKey="id"
            columns={lockColumns}
            dataSource={reservations}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No partner has been locked yet.' }}
          />
        </Card>

        <Card title="Released profiles" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={releasedColumns}
            dataSource={released}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No profiles have been released.' }}
          />
        </Card>
      </Flex>
    </>
  );
};
