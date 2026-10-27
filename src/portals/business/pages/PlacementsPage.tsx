import { Button, Card, DatePicker, Flex, Form, Input, InputNumber, Modal, Progress, Table, TableColumnsType, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useAggregators, useCandidates, useRecruiters, useReservationEvents, useReservations } from '@/api/hooks';
import { updateAggregatorQuota } from '@/api/people';
import { updateHub } from '@/api/reservations';
import { DATE_FORMAT } from '@/domain/constant';
import { formatDate, formatDateTime, toIsoDate } from '@/domain/format';
import { Reservation, ReservationEvent, ReservationEventType } from '@/domain/interface';
import { isJoiningWithinNoticeWindow } from '@/domain/reservation';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { Notice, PageHeader } from '@/shared/components/ui';
import { BUSINESS_MESSAGE, EMPTY_VALUE, TABLE_PAGE_SIZE } from '../constant';
import { AggregatorUsage, HubFormValues, HubUpdateVariables, QuotaUpdateVariables } from '../interface';
import { toPercent } from '../utils';

export const PlacementsPage = () => {
  const [form] = Form.useForm<HubFormValues>();
  const [editing, setEditing] = useState<Reservation>();
  const { data: reservations = [], isLoading } = useReservations();
  const { data: candidates = [] } = useCandidates();
  const { data: recruiters = [] } = useRecruiters();
  const { data: aggregators = [], isLoading: aggregatorsLoading } = useAggregators();
  const { data: events = [], isLoading: eventsLoading } = useReservationEvents();
  const saveHub = useAppMutation(
    ({ candidateId, input }: HubUpdateVariables) => updateHub(candidateId, input),
    BUSINESS_MESSAGE.hubSaved,
  );
  const saveQuota = useAppMutation(
    ({ aggregatorId, quota }: QuotaUpdateVariables) => updateAggregatorQuota(aggregatorId, quota),
    BUSINESS_MESSAGE.quotaSaved,
  );
  const today = toIsoDate();

  const candidateName = (candidateId: string) =>
    candidates.find(candidate => candidate.id === candidateId)?.name ?? EMPTY_VALUE;
  const releasedEvents = events.filter(event => event.type === ReservationEventType.Expired);
  const usage: AggregatorUsage[] = aggregators.map(aggregator => {
    const assigned = reservations.filter(reservation => reservation.aggregatorId === aggregator.id);
    return {
      aggregator,
      used: assigned.length,
      remaining: aggregator.quota - assigned.length,
      candidateNames: assigned.map(reservation => candidateName(reservation.candidateId)),
    };
  });

  const reservationColumns: TableColumnsType<Reservation> = [
    {
      title: 'Provider',
      key: 'provider',
      render: (_, reservation) => <Typography.Text strong>{candidateName(reservation.candidateId)}</Typography.Text>,
    },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, reservation) => {
        const recruiter = recruiters.find(item => item.id === reservation.recruiterId);
        if (!recruiter) return EMPTY_VALUE;
        return (
          <>
            <div>{recruiter.name}</div>
            <div className="muted small">{recruiter.company}</div>
          </>
        );
      },
    },
    {
      title: 'Aggregator',
      key: 'aggregator',
      render: (_, reservation) =>
        aggregators.find(item => item.id === reservation.aggregatorId)?.name ?? (
          <span className="muted">Not assigned</span>
        ),
    },
    { title: 'Start date', key: 'startDate', render: (_, reservation) => formatDate(reservation.startDate) },
    {
      title: 'Reservation deadline',
      key: 'deadline',
      render: (_, reservation) =>
        reservation.aggregatorId ? <Tag color="success">Assigned</Tag> : formatDateTime(reservation.deadlineAt),
    },
    {
      title: 'Hub',
      key: 'hub',
      render: (_, reservation) => {
        if (reservation.hub) return reservation.hub;
        if (isJoiningWithinNoticeWindow(reservation, today)) return <Tag color="warning">Hub due</Tag>;
        return <span className="muted">Pending</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, reservation) => (
        <Button size="small" onClick={() => setEditing(reservation)}>
          {reservation.hub ? 'Edit hub' : 'Assign hub'}
        </Button>
      ),
    },
  ];

  const releasedColumns: TableColumnsType<ReservationEvent> = [
    { title: 'Candidate', key: 'candidate', render: (_, event) => candidateName(event.candidateId) },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, event) => recruiters.find(recruiter => recruiter.id === event.recruiterId)?.name ?? EMPTY_VALUE,
    },
    { title: 'Released at', key: 'at', render: (_, event) => formatDateTime(event.at) },
  ];

  const quotaColumns: TableColumnsType<AggregatorUsage> = [
    {
      title: 'Company',
      key: 'company',
      render: (_, { aggregator }) => <Typography.Text strong>{aggregator.name}</Typography.Text>,
    },
    {
      title: 'Quota',
      key: 'quota',
      render: (_, { aggregator }) => (
        <InputNumber
          key={`${aggregator.id}-${aggregator.quota}`}
          aria-label={`Quota for ${aggregator.name}`}
          min={0}
          precision={0}
          defaultValue={aggregator.quota}
          style={{ width: 96 }}
          onPressEnter={event => event.currentTarget.blur()}
          onBlur={event => {
            const quota = Number(event.target.value);
            if (!event.target.value || !Number.isInteger(quota) || quota === aggregator.quota) return;
            saveQuota.mutate({ aggregatorId: aggregator.id, quota });
          }}
        />
      ),
    },
    { title: 'Used', dataIndex: 'used', key: 'used' },
    { title: 'Remaining', dataIndex: 'remaining', key: 'remaining' },
    {
      title: 'Utilisation',
      key: 'utilisation',
      width: 180,
      render: (_, { used, remaining, aggregator }) => (
        <Progress
          percent={toPercent(used, aggregator.quota)}
          status={remaining < 0 ? 'exception' : 'normal'}
          size="small"
        />
      ),
    },
    {
      title: 'Assigned candidates',
      key: 'candidates',
      render: (_, { candidateNames }) =>
        candidateNames.length ? candidateNames.join(', ') : <span className="muted">{EMPTY_VALUE}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Placements, quotas & hubs"
        subtitle="See recruiter ownership and company allocations; manually update provider hubs."
      />
      <Flex vertical gap={18}>
        <Card title="Current reservations" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="candidateId"
            columns={reservationColumns}
            dataSource={reservations}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No profiles are reserved right now.' }}
          />
        </Card>

        <Card title="Released profiles" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={releasedColumns}
            dataSource={releasedEvents}
            loading={eventsLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No profiles have been released.' }}
          />
        </Card>

        <Card title="Aggregator quota visibility">
          <Notice>
            Each saved aggregator assignment uses one quota place. Production quota rules remain to be confirmed.
          </Notice>
          <Table
            rowKey={row => row.aggregator.id}
            columns={quotaColumns}
            dataSource={usage}
            loading={aggregatorsLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Flex>

      <Modal
        open={Boolean(editing)}
        title={editing && `${editing.hub ? 'Edit' : 'Assign'} hub · ${candidateName(editing.candidateId)}`}
        okText="Save hub"
        confirmLoading={saveHub.isPending}
        destroyOnHidden
        onOk={() => form.submit()}
        onCancel={() => setEditing(undefined)}
      >
        <Notice>
          Business updates hub information two weeks before joining. Allocation logic is not implemented yet.
        </Notice>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          initialValues={{
            hub: editing?.hub,
            startDate: editing?.startDate ? dayjs(editing.startDate) : undefined,
            hubInstructions: editing?.hubInstructions,
          }}
          onFinish={({ hub, startDate, hubInstructions }) => {
            if (!editing) return;
            saveHub.mutate(
              {
                candidateId: editing.candidateId,
                input: { hub: hub.trim(), startDate: toIsoDate(startDate), hubInstructions: hubInstructions?.trim() ?? '' },
              },
              { onSuccess: () => setEditing(undefined) },
            );
          }}
        >
          <Form.Item name="hub" label="Hub / area" rules={[{ required: true, whitespace: true, message: 'Enter the hub' }]}>
            <Input placeholder="e.g. Tampines · East cluster" />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Provider joining date"
            rules={[{ required: true, message: 'Choose the joining date' }]}
          >
            <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hubInstructions" label="Stay-area instructions">
            <Input.TextArea rows={3} placeholder="Where the provider should arrange accommodation" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
