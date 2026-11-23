import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Form, Input, Modal, Popconfirm, Row, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useRecruiters, useReservations } from '@/api/hooks';
import { RecruiterInput } from '@/api/interface';
import {
  addRecruiterAggregator,
  createRecruiter,
  removeRecruiterAggregator,
  resetRecruiterPassword,
  setRecruiterStatus,
} from '@/api/people';
import { RECRUITER_STATUS_TAG } from '@/domain/constant';
import { formatDateTime } from '@/domain/format';
import { AdminReservation, RecruiterStatus, RecruiterWithStats } from '@/domain/interface';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { CandidateAvatar, Notice, PageHeader } from '@/shared/components/ui';
import { TemporaryPasswordModal } from '../components/TemporaryPasswordModal';
import {
  ADMIN_MESSAGE,
  AGGREGATORS,
  APPROVAL_REQUESTS,
  INACTIVE_REASON_LABEL,
  LOCK_STATE_TAG,
  NEVER_SIGNED_IN,
  RECRUITER_SEARCH,
  RECRUITER_STATUS_ACTION,
  RESET_PASSWORD,
  SELF_SIGN_UP_LABEL,
  TABLE_PAGE_SIZE,
} from '../constant';
import {
  AddAggregatorVariables,
  AggregatorFormValues,
  RecruiterStatusVariables,
  RemoveAggregatorVariables,
  TemporaryPasswordNotice,
} from '../interface';

export const RecruitersPage = () => {
  const [form] = Form.useForm<RecruiterInput>();
  const [aggregatorForm] = Form.useForm<AggregatorFormValues>();
  const [notice, setNotice] = useState<TemporaryPasswordNotice>();
  const [managingId, setManagingId] = useState<string>();
  const [search, setSearch] = useState('');
  const { data: recruiters = [], isLoading: recruitersLoading } = useRecruiters();
  const { data: reservations = [], isLoading } = useReservations();
  const addRecruiter = useAppMutation(createRecruiter, ADMIN_MESSAGE.recruiterCreated);
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

  const term = search.trim().toLowerCase();
  const requests = recruiters.filter(recruiter => recruiter.status === RecruiterStatus.Pending);
  const reviewed = recruiters
    .filter(recruiter => recruiter.status !== RecruiterStatus.Pending)
    .filter(recruiter => `${recruiter.name} ${recruiter.company} ${recruiter.email}`.toLowerCase().includes(term));
  const changingId = changeStatus.isPending ? changeStatus.variables?.recruiter.id : undefined;
  const managing = recruiters.find(recruiter => recruiter.id === managingId);

  const identity = (recruiter: RecruiterWithStats) => (
    <Flex align="center" gap={12}>
      <CandidateAvatar name={recruiter.name} size={36} />
      <div>
        <Typography.Text strong>{recruiter.name}</Typography.Text>
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
      title: 'Last sign-in',
      key: 'lastLoginAt',
      render: (_, recruiter) => (recruiter.lastLoginAt ? formatDateTime(recruiter.lastLoginAt) : NEVER_SIGNED_IN),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      render: (_, recruiter) => {
        const action = RECRUITER_STATUS_ACTION[recruiter.status];

        return (
          <Flex gap={8} justify="flex-end">
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
    { title: 'Partner', dataIndex: 'candidateName', key: 'candidate' },
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
        subtitle="Approve account requests, create recruiters, see how each recruiter is doing, and suspend or bring back access."
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

        <Card title="Create recruiter">
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={({ name, company, email }) =>
              addRecruiter.mutate(
                { name: name.trim(), company: company.trim(), email: email.trim().toLowerCase() },
                {
                  onSuccess: created => {
                    form.resetFields();
                    setNotice({
                      name: created.recruiter.name,
                      account: created.recruiter.email,
                      password: created.temporaryPassword,
                    });
                  },
                },
              )
            }
          >
            <Row gutter={18}>
              <Col xs={24} md={8}>
                <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruiter full name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="company" label="Organisation" rules={[{ required: true, whitespace: true }]}>
                  <Input placeholder="Recruitment agency" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                  <Input inputMode="email" placeholder="recruiter@agency.sg" />
                </Form.Item>
              </Col>
            </Row>
            <Notice>
              An account you create here is approved straight away. The recruiter signs in with this email and the temporary
              password shown after creation.
            </Notice>
            <Button type="primary" htmlType="submit" loading={addRecruiter.isPending}>
              Create approved recruiter
            </Button>
          </Form>
        </Card>

        <Card
          title="Recruiters"
          styles={{ body: { padding: 0 } }}
          extra={
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={RECRUITER_SEARCH.placeholder}
              aria-label={RECRUITER_SEARCH.label}
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="admin-table-search"
            />
          }
        >
          <Table
            rowKey="id"
            columns={recruiterColumns}
            dataSource={reviewed}
            loading={recruitersLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: term ? RECRUITER_SEARCH.empty : RECRUITER_SEARCH.none }}
          />
        </Card>

        <Card title="Profile access log" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={lockColumns}
            dataSource={reservations}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No recruiter has opened a profile yet.' }}
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
