import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
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
import {
  exportCandidatesCsv,
  importVerifiedCandidates,
  markCandidateJoined,
  resetPartnerPassword,
  updateSingaporePhone,
} from '@/api/candidates';
import { useCandidates, useInterviewCities, useReservations, useUpcomingSlotDays } from '@/api/hooks';
import { ImportRow, SlotDaySummary, VerifiedImportResult } from '@/api/interface';
import {
  DATE_FORMAT,
  DAY_DATE_FORMAT,
  RECRUITMENT_SOURCE_OPTIONS,
  SINGAPORE_PHONE_PATTERN,
  SOURCE_LABEL,
} from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { buildChannelFunnel } from '@/domain/funnel';
import { Candidate, ChannelFunnelRow, ImportRowOutcome, PartnerState, RecruitmentSource } from '@/domain/interface';
import { findCity, formatSlot, parseSlotId } from '@/domain/slot';
import { Notice, PageHeader, StatTile, VerificationTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, downloadTextFile, parseCsvColumn } from '@/shared/utils/csv';
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
  SINGAPORE_PHONE_NOTE,
  SINGAPORE_PHONE_RULE_MESSAGE,
  SLOT_SCHEDULE_NOTE,
  TABLE_PAGE_SIZE,
  TEMPORARY_PASSWORD,
  VERIFIED_CSV_COLUMN,
  VERIFIED_CSV_NOTE,
} from '../constant';
import { ImportVariables, SingaporePhoneFormValues, SingaporePhoneVariables, TemporaryPasswordNotice, TrackerRow } from '../interface';
import { toPercent } from '../utils';

export const OverviewPage = () => {
  const [phoneForm] = Form.useForm<SingaporePhoneFormValues>();
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: cities = [] } = useInterviewCities();
  const { data: slotDays = [], isLoading: slotsLoading } = useUpcomingSlotDays();
  const { data: reservations = [] } = useReservations();
  const [cityKey, setCityKey] = useState<string>();
  const [source, setSource] = useState<RecruitmentSource>();
  const [weekStart, setWeekStart] = useState<Dayjs>(() => dayjs().subtract(FUNNEL_DEFAULT_OFFSET_DAYS, 'day'));
  const [editing, setEditing] = useState<Candidate>();
  const [importResult, setImportResult] = useState<VerifiedImportResult>();
  const [passwordNotice, setPasswordNotice] = useState<TemporaryPasswordNotice>();
  const savePhone = useAppMutation(
    ({ candidateId, singaporePhone }: SingaporePhoneVariables) => updateSingaporePhone(candidateId, singaporePhone),
    BUSINESS_MESSAGE.singaporePhoneSaved,
  );
  const importVerified = useAppMutation(
    ({ primaryPhones, fileName }: ImportVariables) => importVerifiedCandidates(primaryPhones, fileName),
    BUSINESS_MESSAGE.importCompleted,
  );
  const resetPassword = useAppMutation(resetPartnerPassword, BUSINESS_MESSAGE.passwordReset);
  const markJoined = useAppMutation(markCandidateJoined, BUSINESS_MESSAGE.joinedSaved);
  const exportCsv = useAppMutation(() => exportCandidatesCsv({ cityKey, source }));

  const cityName = (key: string) => findCity(cities, key)?.name ?? key;
  const filteredCandidates = candidates.filter(
    candidate => (!cityKey || candidate.interviewCity === cityKey) && (!source || candidate.source === source),
  );

  const rows: TrackerRow[] = filteredCandidates
    .map(candidate => {
      const slot = candidate.slotId ? parseSlotId(candidate.slotId) : undefined;

      return {
        candidate,
        slotLabel: slot ? formatSlot(slot) : NOT_SCHEDULED,
        reservation: reservations.find(item => item.candidateId === candidate.id),
      };
    })
    .toSorted((a, b) => b.candidate.createdAt.localeCompare(a.candidate.createdAt));

  const channelOptions = RECRUITMENT_SOURCE_OPTIONS.filter(option =>
    candidates.some(candidate => candidate.source === option.value),
  );
  const funnel = FUNNEL_STEPS.map(step => {
    const count = rows.filter(step.matches).length;

    return { label: step.label, count, percent: toPercent(count, rows.length) };
  });
  const signupsByCity = cities.map(city => {
    const count = rows.filter(row => row.candidate.interviewCity === city.key).length;

    return { city, count, percent: toPercent(count, rows.length) };
  });
  const channelFunnel = buildChannelFunnel(filteredCandidates, toIsoDate(weekStart));
  const upcomingDays = slotDays.filter(day => !cityKey || day.cityKey === cityKey);
  const failedRows = importResult?.rows.filter(row => row.outcome !== ImportRowOutcome.Accepted) ?? [];

  const trackerColumns: TableColumnsType<TrackerRow> = [
    {
      title: 'Provider',
      key: 'provider',
      render: (_, { candidate }) => (
        <>
          <Typography.Text strong>{candidate.name}</Typography.Text>
          <div className="muted small">{SOURCE_LABEL[candidate.source]}</div>
        </>
      ),
    },
    {
      title: 'Interview city / slot',
      key: 'slot',
      render: (_, { candidate, slotLabel }) => (
        <>
          <div>{cityName(candidate.interviewCity)}</div>
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
      render: (_, { reservation }) =>
        reservation ? (
          <>
            <div>{reservation.recruiterName}</div>
            <div className="muted small">{reservation.recruiterCompany}</div>
          </>
        ) : (
          <span className="muted">{EMPTY_VALUE}</span>
        ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, { candidate }) => (
        <Dropdown
          menu={{
            items: [
              { key: 'reset', label: 'Issue temporary password' },
              ...(candidate.state === PartnerState.Placed ? [{ key: 'joined', label: 'Mark as joined' }] : []),
            ],
            onClick: ({ key }) => {
              if (key === 'joined') return markJoined.mutate(candidate.id);

              resetPassword.mutate(candidate.id, {
                onSuccess: result =>
                  setPasswordNotice({ title: TEMPORARY_PASSWORD.partnerTitle(candidate.name), password: result.temporaryPassword }),
              });
            },
          }}
        >
          <Button size="small" aria-label={`Actions for ${candidate.name}`}>
            Actions
          </Button>
        </Dropdown>
      ),
    },
  ];

  const failedColumns: TableColumnsType<ImportRow> = [
    { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
    { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
    { title: 'Reason', key: 'reason', render: (_, row) => IMPORT_OUTCOME_LABEL[row.outcome] },
  ];

  const channelColumns: TableColumnsType<ChannelFunnelRow> = [
    { title: 'Channel', key: 'source', render: (_, row) => SOURCE_LABEL[row.source] },
    { title: 'Signups', dataIndex: 'signups', key: 'signups' },
    { title: 'Singapore number', dataIndex: 'withSingaporePhone', key: 'withSingaporePhone' },
    { title: 'UC Verified', dataIndex: 'verified', key: 'verified' },
    { title: 'Placed', dataIndex: 'placed', key: 'placed' },
    { title: 'Conversion %', key: 'conversion', render: (_, row) => `${row.conversion}%` },
  ];

  const slotDayColumns: TableColumnsType<SlotDaySummary> = [
    { title: 'Date', key: 'date', render: (_, day) => dayjs(day.date).format(DAY_DATE_FORMAT) },
    {
      title: 'City / centre',
      key: 'city',
      render: (_, day) => (
        <>
          <div>{cityName(day.cityKey)}</div>
          <div className="muted small">{findCity(cities, day.cityKey)?.centre}</div>
        </>
      ),
    },
    { title: 'Slots left today', dataIndex: 'slots', key: 'slots' },
    { title: 'Booked / capacity', key: 'booked', render: (_, day) => `${day.booked} / ${day.capacity}` },
  ];

  return (
    <>
      <PageHeader
        title="Business overview"
        subtitle="Track signups, Singapore numbers, verification and channel conversion across your recruitment flow."
      />
      <Flex vertical gap={18}>
        {passwordNotice && (
          <Alert
            type="success"
            showIcon
            closable
            onClose={() => setPasswordNotice(undefined)}
            title={passwordNotice.title}
            description={
              <>
                <Typography.Text code copyable>
                  {passwordNotice.password}
                </Typography.Text>
                <div className="small muted" style={{ marginTop: 6 }}>
                  {TEMPORARY_PASSWORD.note}
                </div>
              </>
            }
          />
        )}
        <Card>
          <Flex gap={12} wrap align="center" justify="space-between">
            <Flex gap={12} wrap>
              <Select
                allowClear
                aria-label="Filter by interview city"
                placeholder="All interview cities"
                className="business-filter"
                value={cityKey}
                onChange={setCityKey}
                options={cities.map(city => ({ value: city.key, label: city.name }))}
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
                loading={exportCsv.isPending}
                onClick={() =>
                  exportCsv.mutate(undefined, { onSuccess: csv => downloadTextFile(csv, SIGNUP_EXPORT_FILE_NAME) })
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
            <Card title="Signups by interview city" style={{ height: '100%' }}>
              <Flex vertical gap={10}>
                {signupsByCity.map(item => (
                  <Flex key={item.city.key} justify="space-between" align="center" className="business-geo-tile">
                    <span>{item.city.name}</span>
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

        <Card title="Upcoming interview slots">
          <Notice>{SLOT_SCHEDULE_NOTE}</Notice>
          <Table
            rowKey={day => `${day.date}-${day.cityKey}`}
            columns={slotDayColumns}
            dataSource={upcomingDays}
            loading={slotsLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No upcoming slots.' }}
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
