import { Button, Card, Flex, Form, Input, Modal, Popconfirm, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useRecruiters, useReservations } from '@/api/hooks';
import {
  addRecruiterAggregator,
  removeRecruiterAggregator,
  resetRecruiterPassword,
  setRecruiterStatus,
} from '@/api/people';
import { RECRUITER_STATUS_TAG } from '@/domain/constant';
import { formatDateTime } from '@/domain/format';
import { AdminReservation, RecruiterStatus, RecruiterWithStats } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { TABLE_PAGINATION, TABLE_SCROLL } from '@/shared/components/constant';
import { CandidateAvatar, FilterSelect, PageHeader, SearchBox } from '@/shared/components/ui';
import { matchesSearch } from '@/shared/utils/search';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';
import {
  ACCESS_LOG,
  ADMIN_MESSAGE,
  AGGREGATORS,
  APPROVAL_REQUESTS,
  INACTIVE_REASON_LABEL,
  LAST_SIGN_IN,
  LIST_FILTER,
  LOCK_STATE_FILTER_OPTIONS,
  LOCK_STATE_TAG,
  RECRUITER_SEARCH,
  RECRUITER_STATUS_FILTER_OPTIONS,
  RECRUITER_STATUS_ACTION,
  RESET_PASSWORD,
  SELF_SIGN_UP_LABEL,
} from '../constant';
import {
  AddAggregatorVariables,
  AggregatorFormValues,
  LockFilters,
  RecruiterTableFilters,
  RecruiterStatusVariables,
  RemoveAggregatorVariables,
  TemporaryPasswordNotice,
} from '../interface';
import { filterLocks, lockRecruiterOptions } from '../utils';

export const RecruitersPage = () => {
  const [aggregatorForm] = Form.useForm<AggregatorFormValues>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const [managingId, setManagingId] = useState<string>();
  const [search, setSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [recruiterFilters, setRecruiterFilters] = useState<RecruiterTableFilters>({});
  const [logFilters, setLogFilters] = useState<LockFilters>({});
  const { data: recruiters = [], isLoading: recruitersLoading } = useRecruiters();
  const { data: reservations = [], isLoading } = useReservations();
  const changeStatus = useAppMutation(
    ({ recruiter, status }: RecruiterStatusVariables) => setRecruiterStatus(recruiter.id, status),
    ADMIN_MESSAGE.recruiterAccessUpdated,
  );
  const resetPassword = useAppMutation(
    (recruiter: RecruiterWithStats) => resetRecruiterPassword(recruiter.id),
    ADMIN_MESSAGE.passwordReset,
  );
  const addAggregator = useAppMutation(
    ({ recruiterId, name }: AddAggregatorVariables) => addRecruiterAggregator(recruiterId, name),
    ADMIN_MESSAGE.aggregatorAdded,
  );
  const removeAggregator = useAppMutation(
    ({ recruiterId, aggregator }: RemoveAggregatorVariables) => removeRecruiterAggregator(recruiterId, aggregator.id),
    ADMIN_MESSAGE.aggregatorRemoved,
  );

  const requests = recruiters.filter(recruiter => recruiter.status === RecruiterStatus.Pending);
  const reviewed = recruiters
    .filter(recruiter => recruiter.status !== RecruiterStatus.Pending)
    .filter(recruiter => !recruiterFilters.status || recruiter.status === recruiterFilters.status)
    .filter(recruiter => matchesSearch(search, [recruiter.name, recruiter.company, recruiter.email]));
  const visibleLog = filterLocks(reservations, logFilters).filter(lock =>
    matchesSearch(logSearch, [lock.candidateName, lock.recruiterName, lock.recruiterCompany, lock.employerName]),
  );
  const changingId = changeStatus.isPending ? changeStatus.variables?.recruiter.id : undefined;
  const managing = recruiters.find(recruiter => recruiter.id === managingId);

  const identity = (recruiter: RecruiterWithStats) => (
    <Flex align="center" gap={12}>
      <CandidateAvatar name={recruiter.name} size={36} />
      <div>
        <Typography.Text strong className="nowrap">
          {recruiter.name}
        </Typography.Text>
        <div className="muted small">
          {recruiter.company} · {recruiter.email}
        </div>
      </div>
    </Flex>
  );

  const recruiterColumns: TableColumnsType<RecruiterWithStats> = [
    { title: 'Recruiter', key: 'recruiter', render: (_, recruiter) => identity(recruiter) },
    {
      title: 'Status',
      key: 'status',
      render: (_, recruiter) => (
        <>
          <Tag color={RECRUITER_STATUS_TAG[recruiter.status].color}>{RECRUITER_STATUS_TAG[recruiter.status].label}</Tag>
          {recruiter.selfRegistered && <div className="muted small">{SELF_SIGN_UP_LABEL}</div>}
          <div className="muted small">
            {recruiter.lastLoginAt ? LAST_SIGN_IN.at(formatDateTime(recruiter.lastLoginAt)) : LAST_SIGN_IN.never}
          </div>
        </>
      ),
    },
    {
      title: AGGREGATORS.column,
      key: 'aggregators',
      render: (_, recruiter) =>
        recruiter.aggregators.length ? (
          <Flex gap={4} wrap className="admin-aggregator-tags">
            {recruiter.aggregators.map(aggregator => (
              <Tag key={aggregator.id}>{aggregator.name}</Tag>
            ))}
          </Flex>
        ) : (
          <span className="muted">{AGGREGATORS.none}</span>
        ),
    },
    {
      title: 'Locks acquired',
      dataIndex: 'locksAcquired',
      key: 'locksAcquired',
      align: 'right',
      sorter: (a, b) => a.locksAcquired - b.locksAcquired,
    },
    {
      title: 'Placements submitted',
      dataIndex: 'placementsSubmitted',
      key: 'placementsSubmitted',
      align: 'right',
      sorter: (a, b) => a.placementsSubmitted - b.placementsSubmitted,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, recruiter) => {
        const action = RECRUITER_STATUS_ACTION[recruiter.status];

        return (
          <Flex vertical gap={6} align="flex-end">
            <Button size="small" aria-label={`${AGGREGATORS.manage} of ${recruiter.name}`} onClick={() => setManagingId(recruiter.id)}>
              {AGGREGATORS.manage}
            </Button>
            <Popconfirm
              title={RESET_PASSWORD.confirmTitle(recruiter.name)}
              description={RESET_PASSWORD.confirmNote}
              okText={RESET_PASSWORD.action}
              placement="topRight"
              onConfirm={() =>
                resetPassword.mutate(recruiter, {
                  onSuccess: result =>
                    setNotice({ name: recruiter.name, account: recruiter.email, password: result.temporaryPassword }),
                })
              }
            >
              <Button
                size="small"
                aria-label={`${RESET_PASSWORD.action} for ${recruiter.name}`}
                loading={resetPassword.isPending && resetPassword.variables?.id === recruiter.id}
              >
                {RESET_PASSWORD.action}
              </Button>
            </Popconfirm>
            {action && (
              <Button
                size="small"
                danger={action.danger}
                aria-label={`${action.label} ${recruiter.name}`}
                loading={changingId === recruiter.id}
                onClick={() => changeStatus.mutate({ recruiter, status: action.next })}
              >
                {action.label}
              </Button>
            )}
          </Flex>
        );
      },
    },
  ];

  const lockColumns: TableColumnsType<AdminReservation> = [
    { title: 'Locked at', key: 'lockedAt', render: (_, lock) => formatDateTime(lock.lockedAt) },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, lock) => (
        <>
          <div>{lock.recruiterName}</div>
          <div className="muted small">{lock.recruiterCompany}</div>
        </>
      ),
    },
    { title: 'Candidate', dataIndex: 'candidateName', key: 'candidate' },
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
  ];

  return (
    <>
      <PageHeader
        title="Recruiter access"
        subtitle="Approve account requests, see how each recruiter is doing, and suspend or bring back access. Create a recruiter from the sidebar."
      />
      <Flex vertical gap={18}>
        <Card title={`${APPROVAL_REQUESTS.title} (${requests.length})`}>
          <Typography.Paragraph type="secondary" className="small">
            {APPROVAL_REQUESTS.note}
          </Typography.Paragraph>
          {!requests.length && <Typography.Text type="secondary">{APPROVAL_REQUESTS.none}</Typography.Text>}
          {requests.map(recruiter => (
            <Flex key={recruiter.id} justify="space-between" align="center" gap={12} wrap className="admin-directory-row">
              {identity(recruiter)}
              <Flex align="center" gap={8}>
                <span className="muted small">Requested {formatDateTime(recruiter.createdAt)}</span>
                <Button
                  type="primary"
                  size="small"
                  aria-label={`${APPROVAL_REQUESTS.approve} ${recruiter.name}`}
                  loading={changingId === recruiter.id}
                  onClick={() => changeStatus.mutate({ recruiter, status: RecruiterStatus.Active })}
                >
                  {APPROVAL_REQUESTS.approve}
                </Button>
                <Popconfirm
                  title={APPROVAL_REQUESTS.rejectTitle(recruiter.name)}
                  description={APPROVAL_REQUESTS.rejectNote}
                  okText={APPROVAL_REQUESTS.reject}
                  placement="topRight"
                  onConfirm={() => changeStatus.mutate({ recruiter, status: RecruiterStatus.Rejected })}
                >
                  <Button size="small" danger aria-label={`${APPROVAL_REQUESTS.reject} ${recruiter.name}`}>
                    {APPROVAL_REQUESTS.reject}
                  </Button>
                </Popconfirm>
              </Flex>
            </Flex>
          ))}
        </Card>

        <Card
          title="Recruiters"
          styles={{ body: { padding: 0 } }}
          extra={
            <Flex gap={12} wrap>
              <FilterSelect
                label={LIST_FILTER.recruiterStatusLabel}
                placeholder={LIST_FILTER.recruiterStatusPlaceholder}
                value={recruiterFilters.status}
                options={RECRUITER_STATUS_FILTER_OPTIONS}
                onChange={status => setRecruiterFilters({ status })}
              />
              <SearchBox value={search} onChange={setSearch} placeholder={RECRUITER_SEARCH.placeholder} label={RECRUITER_SEARCH.label} />
            </Flex>
          }
        >
          <Table
            rowKey="id"
            columns={recruiterColumns}
            dataSource={reviewed}
            loading={recruitersLoading}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            locale={{ emptyText: search.trim() || recruiterFilters.status ? RECRUITER_SEARCH.empty : RECRUITER_SEARCH.none }}
          />
        </Card>

        <Card
          title={ACCESS_LOG.title}
          styles={{ body: { padding: 0 } }}
          extra={<SearchBox value={logSearch} onChange={setLogSearch} placeholder={ACCESS_LOG.searchPlaceholder} label={ACCESS_LOG.searchLabel} />}
        >
          <Flex gap={12} wrap className="list-filters">
            <FilterSelect
              label={LIST_FILTER.recruiterLabel}
              placeholder={LIST_FILTER.recruiterPlaceholder}
              value={logFilters.recruiterId}
              options={lockRecruiterOptions(reservations)}
              onChange={recruiterId => setLogFilters(current => ({ ...current, recruiterId }))}
            />
            <FilterSelect
              label={LIST_FILTER.lockStateLabel}
              placeholder={LIST_FILTER.lockStatePlaceholder}
              value={logFilters.state}
              options={LOCK_STATE_FILTER_OPTIONS}
              onChange={state => setLogFilters(current => ({ ...current, state }))}
            />
          </Flex>
          <Table
            rowKey="id"
            columns={lockColumns}
            dataSource={visibleLog}
            loading={isLoading}
            pagination={TABLE_PAGINATION}
            scroll={TABLE_SCROLL}
            locale={{ emptyText: logSearch.trim() || Object.values(logFilters).some(Boolean) ? ACCESS_LOG.searchEmpty : ACCESS_LOG.empty }}
          />
        </Card>
      </Flex>
      <TemporaryPasswordModal notice={notice} onClose={() => setNotice(undefined)} />
      <Modal
        open={Boolean(managing)}
        title={managing && AGGREGATORS.modalTitle(managing.name)}
        destroyOnHidden
        onCancel={() => setManagingId(undefined)}
        footer={
          <Button type="primary" onClick={() => setManagingId(undefined)}>
            {AGGREGATORS.close}
          </Button>
        }
      >
        <Typography.Paragraph type="secondary" className="small">
          {AGGREGATORS.note}
        </Typography.Paragraph>
        {!managing?.aggregators.length && <Typography.Paragraph type="secondary">{AGGREGATORS.empty}</Typography.Paragraph>}
        {managing?.aggregators.map(aggregator => (
          <Flex key={aggregator.id} justify="space-between" align="center" gap={12} className="admin-directory-row">
            <Typography.Text strong>{aggregator.name}</Typography.Text>
            <Popconfirm
              title={AGGREGATORS.removeTitle(aggregator.name)}
              description={AGGREGATORS.removeNote}
              okText={AGGREGATORS.remove}
              placement="topRight"
              onConfirm={() => removeAggregator.mutate({ recruiterId: managing.id, aggregator })}
            >
              <Button
                size="small"
                danger
                aria-label={`${AGGREGATORS.remove} ${aggregator.name}`}
                loading={removeAggregator.isPending && removeAggregator.variables?.aggregator.id === aggregator.id}
              >
                {AGGREGATORS.remove}
              </Button>
            </Popconfirm>
          </Flex>
        ))}
        <Form
          form={aggregatorForm}
          name="aggregator"
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          className="admin-aggregator-form"
          onFinish={({ name }) => {
            if (!managing) return;

            addAggregator.mutate({ recruiterId: managing.id, name: name.trim() }, { onSuccess: () => aggregatorForm.resetFields() });
          }}
        >
          <Form.Item name="name" label={AGGREGATORS.nameLabel} rules={[{ required: true, whitespace: true, message: AGGREGATORS.nameError }]}>
            <Input placeholder={AGGREGATORS.namePlaceholder} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={addAggregator.isPending}>
            {AGGREGATORS.add}
          </Button>
        </Form>
      </Modal>
    </>
  );
};
