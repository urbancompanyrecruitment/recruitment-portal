import { Card, Flex, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useReservations } from '@/api/hooks';
import { LOCK_NO_EXPIRY_LABEL } from '@/domain/constant';
import { formatDate, formatDateTime } from '@/domain/format';
import { AdminReservation, LockOrigin } from '@/domain/interface';
import { TABLE_PAGINATION, TABLE_SCROLL } from '@/shared/components/constant';
import { FilterSelect, Notice, PageHeader, SearchBox } from '@/shared/components/ui';
import { matchesSearch } from '@/shared/utils/search';
import {
  EMPTY_VALUE,
  INACTIVE_REASON_LABEL,
  LIST_FILTER,
  LOCK_ORIGIN_FILTER_OPTIONS,
  LOCK_EXPIRY_NOTE,
  LOCK_ORIGIN_LABEL,
  LOCK_STATE_FILTER_OPTIONS,
  LOCK_STATE_TAG,
  PLACEMENTS_PAGE,
  RELEASED_REASONS,
} from '../constant';
import { LockFilters } from '../interface';
import { filterLocks, lockRecruiterOptions } from '../utils';

export const PlacementsPage = () => {
  const { data: reservations = [], isLoading } = useReservations();
  const [search, setSearch] = useState('');
  const [lockFilters, setLockFilters] = useState<LockFilters>({});
  const matching = filterLocks(reservations, lockFilters).filter(lock =>
    matchesSearch(search, [lock.candidateName, lock.recruiterName, lock.recruiterCompany, lock.employerName]),
  );
  const released = matching.filter(lock => lock.inactiveReason && RELEASED_REASONS.includes(lock.inactiveReason));
  const isSearching = Boolean(search.trim()) || Object.values(lockFilters).some(Boolean);

  const lockColumns: TableColumnsType<AdminReservation> = [
    {
      title: 'Candidate',
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
          {lock.origin !== LockOrigin.Recruiter && <div className="muted small">{LOCK_ORIGIN_LABEL[lock.origin]}</div>}
        </>
      ),
    },
    { title: 'Locked at', key: 'lockedAt', render: (_, lock) => formatDateTime(lock.lockedAt) },
    {
      title: 'Release at',
      key: 'lockReleaseAt',
      render: (_, lock) => (lock.lockReleaseAt === undefined ? LOCK_NO_EXPIRY_LABEL : formatDateTime(lock.lockReleaseAt)),
    },
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
      title: 'Aggregator',
      key: 'aggregator',
      render: (_, lock) => lock.employerName ?? <span className="muted">Not saved</span>,
    },
    { title: 'Start date', key: 'startDate', render: (_, lock) => formatDate(lock.startDate) },
  ];

  const releasedColumns: TableColumnsType<AdminReservation> = [
    { title: 'Candidate', dataIndex: 'candidateName', key: 'candidate' },
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
      <PageHeader title={PLACEMENTS_PAGE.title} subtitle={PLACEMENTS_PAGE.subtitle} />
      <Flex vertical gap={18}>
        <Card>
          <Flex gap={12} wrap>
            <SearchBox value={search} onChange={setSearch} placeholder={PLACEMENTS_PAGE.searchPlaceholder} label={PLACEMENTS_PAGE.searchLabel} />
            <FilterSelect
              label={LIST_FILTER.recruiterLabel}
              placeholder={LIST_FILTER.recruiterPlaceholder}
              value={lockFilters.recruiterId}
              options={lockRecruiterOptions(reservations)}
              onChange={recruiterId => setLockFilters(current => ({ ...current, recruiterId }))}
            />
            <FilterSelect
              label={LIST_FILTER.lockStateLabel}
              placeholder={LIST_FILTER.lockStatePlaceholder}
              value={lockFilters.state}
              options={LOCK_STATE_FILTER_OPTIONS}
              onChange={state => setLockFilters(current => ({ ...current, state }))}
            />
            <FilterSelect
              label={LIST_FILTER.originLabel}
              placeholder={LIST_FILTER.originPlaceholder}
              value={lockFilters.origin}
              options={LOCK_ORIGIN_FILTER_OPTIONS}
              onChange={origin => setLockFilters(current => ({ ...current, origin }))}
            />
          </Flex>
          <div className="muted small" style={{ marginTop: 8 }}>
            {PLACEMENTS_PAGE.searchNote}
          </div>
        </Card>
        <Card title={PLACEMENTS_PAGE.locksTitle} styles={{ body: { padding: 0 } }}>
          <Notice style={{ margin: 16 }}>{LOCK_EXPIRY_NOTE}</Notice>
          <Table
            rowKey="id"
            columns={lockColumns}
            dataSource={matching}
            loading={isLoading}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            locale={{ emptyText: isSearching ? PLACEMENTS_PAGE.searchEmpty : PLACEMENTS_PAGE.locksEmpty }}
          />
        </Card>

        <Card title={PLACEMENTS_PAGE.releasedTitle} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={releasedColumns}
            dataSource={released}
            loading={isLoading}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            locale={{ emptyText: isSearching ? PLACEMENTS_PAGE.searchEmpty : PLACEMENTS_PAGE.releasedEmpty }}
          />
        </Card>
      </Flex>
    </>
  );
};
