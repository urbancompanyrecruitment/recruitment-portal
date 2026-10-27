import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Flex, Progress, Row, Select, Table, TableColumnsType, Tag, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useAggregators, useCandidates, useRecruiters, useReservations, useSlots, useTrainers } from '@/api/hooks';
import {
  ASSESSMENT_STAGES,
  DATE_FORMAT,
  DAY_DATE_FORMAT,
  GEOGRAPHIES,
  RECRUITMENT_SOURCES,
  STAGE_LABEL,
} from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { buildChannelFunnel, formatPassRate } from '@/domain/funnel';
import { ChannelFunnelRow, Geography, InterviewSlot, RecruitmentSource, YesNo } from '@/domain/interface';
import { countSlotBookings, formatSlot } from '@/domain/slot';
import { Notice, PageHeader, ResultTag, StatTile, VerificationTag } from '@/shared/components/ui';
import { downloadCsv } from '@/shared/utils/csv';
import {
  EMPTY_VALUE,
  FUNNEL_BAR_HEIGHT,
  FUNNEL_DEFAULT_OFFSET_DAYS,
  FUNNEL_STEPS,
  INVITATION_TAG_COLOR,
  NOT_SCHEDULED,
  OVERVIEW_STATS,
  TABLE_PAGE_SIZE,
  TRACKER_CSV_FILE_NAME,
  TRACKER_CSV_HEADERS,
} from '../constant';
import { TrackerRow } from '../interface';
import { toPercent } from '../utils';

export const OverviewPage = () => {
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: slots = [], isLoading: slotsLoading } = useSlots();
  const { data: trainers = [] } = useTrainers();
  const { data: recruiters = [] } = useRecruiters();
  const { data: aggregators = [] } = useAggregators();
  const { data: reservations = [] } = useReservations();
  const [geography, setGeography] = useState<Geography>();
  const [source, setSource] = useState<RecruitmentSource>();
  const [weekStart, setWeekStart] = useState<Dayjs>(() => dayjs().subtract(FUNNEL_DEFAULT_OFFSET_DAYS, 'day'));

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
  const channelFunnel = buildChannelFunnel(filteredCandidates, toIsoDate(weekStart));
  const interviewSlots = slots.filter(slot => !geography || slot.geography === geography);

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
    {
      title: 'Stage results',
      key: 'results',
      render: (_, { candidate }) => (
        <Flex gap={4} wrap>
          {ASSESSMENT_STAGES.map(stage => (
            <ResultTag key={stage} result={candidate.results[stage]} label={STAGE_LABEL[stage]} />
          ))}
        </Flex>
      ),
    },
    {
      title: 'Invitation status',
      key: 'invitation',
      render: (_, { candidate }) => (
        <Tag color={INVITATION_TAG_COLOR[candidate.invitationStatus]}>{candidate.invitationStatus}</Tag>
      ),
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
    {
      title: 'Trainer comments',
      key: 'notes',
      width: 280,
      render: (_, { candidate }) =>
        candidate.notes.length ? (
          <Flex vertical gap={4}>
            {candidate.notes.map(note => (
              <span key={note.id} className="small">
                <strong>{note.by}:</strong> {note.text}
              </span>
            ))}
          </Flex>
        ) : (
          <span className="muted">{EMPTY_VALUE}</span>
        ),
    },
  ];

  const channelColumns: TableColumnsType<ChannelFunnelRow> = [
    { title: 'Channel', dataIndex: 'source', key: 'source' },
    { title: 'Signups', dataIndex: 'signups', key: 'signups' },
    ...ASSESSMENT_STAGES.map(stage => ({
      title: `${STAGE_LABEL[stage]} pass rate`,
      key: stage,
      render: (_: unknown, row: ChannelFunnelRow) => formatPassRate(row.passRates[stage]),
    })),
    { title: 'Selected PROs', dataIndex: 'selected', key: 'selected' },
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
        subtitle="Track signups, assessment results and channel conversion across your recruitment flow."
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
            <Button
              icon={<DownloadOutlined />}
              disabled={!rows.length}
              onClick={() =>
                downloadCsv(
                  [
                    TRACKER_CSV_HEADERS,
                    ...rows.map(({ candidate, slotLabel, recruiter, aggregator, reservation }) => [
                      candidate.name,
                      candidate.phone,
                      candidate.country,
                      candidate.interviewGeography,
                      candidate.source,
                      slotLabel,
                      ...ASSESSMENT_STAGES.map(stage => candidate.results[stage]),
                      candidate.verified ? YesNo.Yes : YesNo.No,
                      recruiter?.name,
                      aggregator?.name,
                      reservation?.startDate,
                      reservation?.hub,
                    ]),
                  ],
                  TRACKER_CSV_FILE_NAME,
                )
              }
            >
              Download tracker CSV
            </Button>
          </Flex>
        </Card>

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

        <Card title="Candidate tracker" styles={{ body: { padding: 0 } }}>
          <Table
            rowKey={row => row.candidate.id}
            columns={trackerColumns}
            dataSource={rows}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No candidates match these filters.' }}
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
          <Notice>
            Signup cohort for the selected week; pass rate = passes / assessed candidates. Pending results are
            excluded.
          </Notice>
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
    </>
  );
};
