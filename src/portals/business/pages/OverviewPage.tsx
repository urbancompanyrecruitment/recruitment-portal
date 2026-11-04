import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Table,
  TableColumnsType,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { importVerifiedCandidates, updateSingaporePhone } from '@/api/candidates';
import { useAggregators, useCandidates, useRecruiters, useReservations, useSlots, useTrainers } from '@/api/hooks';
import { ImportRow, VerifiedImportResult } from '@/api/interface';
import { DATE_FORMAT, DAY_DATE_FORMAT, GEOGRAPHIES, RECRUITMENT_SOURCES, SINGAPORE_PHONE_PATTERN } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { buildChannelFunnel } from '@/domain/funnel';
import { Candidate, ChannelFunnelRow, Geography, ImportRowOutcome, InterviewSlot, RecruitmentSource } from '@/domain/interface';
import { countSlotBookings, formatSlot } from '@/domain/slot';
import { Notice, PageHeader, StatTile, VerificationTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, parseCsvColumn } from '@/shared/utils/csv';
import {
  BUSINESS_MESSAGE,
  EMPTY_VALUE,
  FAIL_CSV_FILE_NAME,
  FAIL_CSV_HEADERS,
  FUNNEL_BAR_HEIGHT,
  FUNNEL_DEFAULT_OFFSET_DAYS,
  FUNNEL_STEPS,
  IMPORT_OUTCOME_LABEL,
  NOT_SCHEDULED,
  OVERVIEW_STATS,
  SIGNUP_EXPORT_FILE_NAME,
  SIGNUP_EXPORT_HEADERS,
  SINGAPORE_PHONE_NOTE,
  SINGAPORE_PHONE_RULE_MESSAGE,
  TABLE_PAGE_SIZE,
  VERIFIED_CSV_COLUMN,
  VERIFIED_CSV_NOTE,
} from '../constant';
import { ImportVariables, SingaporePhoneFormValues, SingaporePhoneVariables, TrackerRow } from '../interface';
import { toPercent } from '../utils';

export const OverviewPage = () => {
  const [phoneForm] = Form.useForm<SingaporePhoneFormValues>();
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: slots = [], isLoading: slotsLoading } = useSlots();
  const { data: trainers = [] } = useTrainers();
  const { data: recruiters = [] } = useRecruiters();
  const { data: aggregators = [] } = useAggregators();
  const { data: reservations = [] } = useReservations();
  const [geography, setGeography] = useState<Geography>();
  const [source, setSource] = useState<RecruitmentSource>();
  const [weekStart, setWeekStart] = useState<Dayjs>(() => dayjs().subtract(FUNNEL_DEFAULT_OFFSET_DAYS, 'day'));
  const [editing, setEditing] = useState<Candidate>();
  const [importResult, setImportResult] = useState<VerifiedImportResult>();
  const savePhone = useAppMutation(
    ({ candidateId, singaporePhone }: SingaporePhoneVariables) => updateSingaporePhone(candidateId, singaporePhone),
    BUSINESS_MESSAGE.singaporePhoneSaved,
  );
  const importVerified = useAppMutation(
    ({ primaryPhones, fileName }: ImportVariables) => importVerifiedCandidates(primaryPhones, fileName),
    BUSINESS_MESSAGE.importCompleted,
  );

  const filteredCandidates = candidates.filter(
    candidate =>
      (!geography || candidate.interviewGeography === geography) && (!source || candidate.source === source),
  );

  const rows: TrackerRow[] = filteredCandidates
    .map(candidate => {
      const slot = slots.find(item => item.id === candidate.slotId);
      const reservation = reservations.find(item => item.candidateId === candidate.id);

      return {
        candidate,
        slotLabel: slot ? formatSlot(slot) : NOT_SCHEDULED,
        reservation,
        recruiter: recruiters.find(item => item.id === reservation?.recruiterId),
        aggregator: aggregators.find(item => item.id === reservation?.aggregatorId),
      };
    })
    .toSorted((a, b) => b.candidate.createdAt.localeCompare(a.candidate.createdAt));

  const channelOptions = RECRUITMENT_SOURCES.filter(item => candidates.some(candidate => candidate.source === item)).map(
    item => ({ value: item, label: item }),
  );
  const funnel = FUNNEL_STEPS.map(step => {
    const count = rows.filter(step.matches).length;

    return { label: step.label, count, percent: toPercent(count, rows.length) };
  });
  const signupsByGeography = GEOGRAPHIES.map(item => {
    const count = rows.filter(row => row.candidate.interviewGeography === item).length;

    return { geography: item, count, percent: toPercent(count, rows.length) };
  });
  const channelFunnel = buildChannelFunnel(filteredCandidates, reservations, toIsoDate(weekStart));
  const interviewSlots = slots.filter(slot => !geography || slot.geography === geography);
  const failedRows = importResult?.rows.filter(row => row.outcome !== ImportRowOutcome.Accepted) ?? [];

  const trackerColumns: TableColumnsType<TrackerRow> = [
    {
      title: 'Provider',
      key: 'provider',
      render: (_, { candidate }) => (
        <>
          <Typography.Text strong>{candidate.name}</Typography.Text>
          <div className="muted small">{candidate.source}</div>
        </>
      ),
    },
    {
      title: 'Geography / slot',
      key: 'slot',
      render: (_, { candidate, slotLabel }) => (
        <>
          <div>{candidate.interviewGeography}</div>
          <div className="muted small">{slotLabel}</div>
        </>
      ),
    },
    { title: 'Primary mobile', key: 'primaryPhone', render: (_, { candidate }) => candidate.primaryPhone },
    {
      title: 'Singapore mobile',
      key: 'singaporePhone',
      render: (_, { candidate }) => (
        <Flex align="center" gap={8}>
          <span className={candidate.singaporePhone ? undefined : 'muted'}>{candidate.singaporePhone ?? EMPTY_VALUE}</span>
          <Button
            size="small"
            aria-label={`${candidate.singaporePhone ? 'Edit' : 'Add'} Singapore number for ${candidate.name}`}
            onClick={() => setEditing(candidate)}
          >
            {candidate.singaporePhone ? 'Edit' : 'Add'}
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Onboarding',
      key: 'onboarding',
      render: (_, { candidate }) => {
        if (candidate.onboarding?.approvedAt) return <Tag color="success">Approved</Tag>;

        if (candidate.onboarding) return <Tag color="blue">Lead created</Tag>;

        return <span className="muted">{EMPTY_VALUE}</span>;
      },
    },
    {
      title: 'UC Verified',
      key: 'verified',
      render: (_, { candidate }) => <VerificationTag verified={candidate.verified} />,
    },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, { recruiter }) =>
        recruiter ? (
          <>
            <div>{recruiter.name}</div>
            <div className="muted small">{recruiter.company}</div>
          </>
        ) : (
          <span className="muted">{EMPTY_VALUE}</span>
        ),
    },
  ];

  const failedColumns: TableColumnsType<ImportRow> = [
    { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
    { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
    { title: 'Reason', key: 'reason', render: (_, row) => IMPORT_OUTCOME_LABEL[row.outcome] },
  ];

  const channelColumns: TableColumnsType<ChannelFunnelRow> = [
    { title: 'Channel', dataIndex: 'source', key: 'source' },
    { title: 'Signups', dataIndex: 'signups', key: 'signups' },
    { title: 'Singapore number', dataIndex: 'withSingaporePhone', key: 'withSingaporePhone' },
    { title: 'UC Verified', dataIndex: 'verified', key: 'verified' },
    { title: 'Placed', dataIndex: 'placed', key: 'placed' },
    { title: 'Conversion %', key: 'conversion', render: (_, row) => `${row.conversion}%` },
  ];

  const interviewColumns: TableColumnsType<InterviewSlot> = [
    { title: 'Date', key: 'date', render: (_, slot) => dayjs(slot.date).format(DAY_DATE_FORMAT) },
    {
      title: 'Time / geography',
      key: 'time',
      render: (_, slot) => (
        <>
          <div>
            {slot.time} · {slot.timeZone}
          </div>
          <div className="muted small">{slot.geography}</div>
        </>
      ),
    },
    {
      title: 'Trainer',
      key: 'trainer',
      render: (_, slot) => trainers.find(trainer => trainer.id === slot.trainerId)?.name ?? EMPTY_VALUE,
    },
    {
      title: 'Bookings',
      key: 'bookings',
      render: (_, slot) => (
        <Flex gap={8} align="center">
          {countSlotBookings(candidates, slot.id)} / {slot.capacity}
          {!slot.isOpen && <Tag>Closed</Tag>}
        </Flex>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Business overview"
        subtitle="Track signups, Singapore numbers, verification and channel conversion across your recruitment flow."
      />
      <Flex vertical gap={18}>
        <Card>
          <Flex gap={12} wrap align="center" justify="space-between">
            <Flex gap={12} wrap>
              <Select
                allowClear
                aria-label="Filter by geography"
                placeholder="All geographies"
                className="business-filter"
                value={geography}
                onChange={setGeography}
                options={GEOGRAPHIES.map(item => ({ value: item, label: item }))}
              />
              <Select
                allowClear
                aria-label="Filter by channel"
                placeholder="All channels"
                className="business-filter"
                value={source}
                onChange={setSource}
                options={channelOptions}
              />
            </Flex>
            <Flex gap={8} wrap>
              <Button
                icon={<DownloadOutlined />}
                disabled={!rows.length}
                onClick={() =>
                  downloadCsv(
                    [
                      SIGNUP_EXPORT_HEADERS,
                      ...rows.map(({ candidate }) => [
                        candidate.name,
                        `${candidate.city}, ${candidate.country}`,
                        candidate.primaryPhone,
                      ]),
                    ],
                    SIGNUP_EXPORT_FILE_NAME,
                  )
                }
              >
                Download signed-up partners CSV
              </Button>
              <Upload
                accept=".csv,text/csv"
                showUploadList={false}
                beforeUpload={file => {
                  file
                    .text()
                    .then(text =>
                      importVerified.mutate(
                        { primaryPhones: parseCsvColumn(text, VERIFIED_CSV_COLUMN), fileName: file.name },
                        { onSuccess: setImportResult },
                      ),
                    );

                  return false;
                }}
              >
                <Button type="primary" icon={<UploadOutlined />} loading={importVerified.isPending}>
                  Upload verified partners CSV
                </Button>
              </Upload>
            </Flex>
          </Flex>
          <Typography.Paragraph type="secondary" className="small" style={{ margin: '12px 0 0' }}>
            {VERIFIED_CSV_NOTE}
          </Typography.Paragraph>
        </Card>

        {importResult && (
          <Card
            title={`Verified list: ${importResult.fileName}`}
            extra={
              failedRows.length ? (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    downloadCsv(
                      [
                        FAIL_CSV_HEADERS,
                        ...failedRows.map(row => [row.rowNumber, row.primaryPhone, IMPORT_OUTCOME_LABEL[row.outcome]]),
                      ],
                      FAIL_CSV_FILE_NAME,
                    )
                  }
                >
                  Download fail CSV
                </Button>
              ) : null
            }
          >
            <Alert
              type={failedRows.length ? 'warning' : 'success'}
              showIcon
              title={`${importResult.counts.accepted} verified and approved, ${importResult.counts.failed} failed out of ${importResult.counts.rows} rows.`}
              style={{ marginBottom: failedRows.length ? 16 : 0 }}
            />
            {failedRows.length > 0 && (
              <Table rowKey="rowNumber" columns={failedColumns} dataSource={failedRows} pagination={false} size="small" />
            )}
          </Card>
        )}

        <Row gutter={[18, 18]}>
          {OVERVIEW_STATS.map(stat => (
            <Col xs={24} sm={12} xl={6} key={stat.label}>
              <StatTile label={stat.label} value={rows.filter(stat.matches).length} hint={stat.hint} to={stat.to} />
            </Col>
          ))}
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} lg={15}>
            <Card title="Recruitment funnel" style={{ height: '100%' }}>
              <Flex vertical gap={6}>
                {funnel.map(step => (
                  <div key={step.label} className="business-funnel-row">
                    <span>{step.label}</span>
                    <Progress percent={step.percent} status="normal" showInfo={false} size={{ height: FUNNEL_BAR_HEIGHT }} />
                    <span className="business-funnel-count">
                      <strong>{step.count}</strong>
                      <span className="muted"> · {step.percent}%</span>
                    </span>
                  </div>
                ))}
              </Flex>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card title="Signups by geography" style={{ height: '100%' }}>
              <Flex vertical gap={10}>
                {signupsByGeography.map(item => (
                  <Flex key={item.geography} justify="space-between" align="center" className="business-geo-tile">
                    <span>{item.geography}</span>
                    <Flex align="baseline" gap={6}>
                      <span className="business-geo-count">{item.count}</span>
                      <span className="muted small">{item.percent}%</span>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Col>
        </Row>

        <Card title="Signed-up partners" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey={row => row.candidate.id}
            columns={trackerColumns}
            dataSource={rows}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No partners match these filters.' }}
          />
        </Card>

        <Card
          title="Recruitment funnel by channel"
          extra={
            <Flex align="center" gap={8}>
              <span className="muted small">Week starting</span>
              <DatePicker
                aria-label="Week starting"
                allowClear={false}
                format={DATE_FORMAT}
                value={weekStart}
                onChange={value => setWeekStart(value ?? weekStart)}
              />
            </Flex>
          }
        >
          <Notice>Signup cohort for the selected week; conversion = UC Verified / signups.</Notice>
          <Table
            rowKey="source"
            columns={channelColumns}
            dataSource={channelFunnel}
            loading={isLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No signups in this week.' }}
          />
        </Card>

        <Card title="Interviews by day" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={interviewColumns}
            dataSource={interviewSlots}
            loading={slotsLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No interview sessions published.' }}
          />
        </Card>
      </Flex>

      <Modal
        open={Boolean(editing)}
        title={editing && `${editing.singaporePhone ? 'Update' : 'Add'} Singapore number · ${editing.name}`}
        okText="Save number"
        confirmLoading={savePhone.isPending}
        destroyOnHidden
        onOk={() => phoneForm.submit()}
        onCancel={() => setEditing(undefined)}
      >
        <Notice>{SINGAPORE_PHONE_NOTE}</Notice>
        <Form
          form={phoneForm}
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          initialValues={{ singaporePhone: editing?.singaporePhone }}
          onFinish={({ singaporePhone }) => {
            if (!editing) return;

            savePhone.mutate(
              { candidateId: editing.id, singaporePhone: singaporePhone.trim() },
              { onSuccess: () => setEditing(undefined) },
            );
          }}
        >
          <Form.Item
            name="singaporePhone"
            label="Singapore mobile number"
            rules={[{ required: true, message: SINGAPORE_PHONE_RULE_MESSAGE }, { pattern: SINGAPORE_PHONE_PATTERN, message: SINGAPORE_PHONE_RULE_MESSAGE }]}
          >
            <Input type="tel" placeholder="+65 9123 4567" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
