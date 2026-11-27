import { Card, Col, DatePicker, Flex, Progress, Row, Table, TableColumnsType } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates, useInterviewCities, useUpcomingSlotDays } from '@/api/hooks';
import { CandidateFilters, SlotDaySummary } from '@/api/interface';
import { DATE_FORMAT, DAY_DATE_FORMAT, SOURCE_LABEL } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { buildChannelFunnel } from '@/domain/funnel';
import { ChannelFunnelRow } from '@/domain/interface';
import { findCity } from '@/domain/slot';
import { TABLE_SCROLL } from '@/shared/components/constant';
import { Notice, PageHeader, StatTile } from '@/shared/components/ui';
import { PartnerFilters } from '../components/PartnerFilters';
import {
  ADMIN_PARTNERS_PATH,
  FUNNEL_BAR_HEIGHT,
  FUNNEL_DEFAULT_OFFSET_DAYS,
  FUNNEL_STEPS,
  OVERVIEW_PAGE,
  OVERVIEW_STATS,
  SLOT_SCHEDULE_NOTE,
} from '../constant';
import { filterCandidates, toPercent } from '../utils';

export const OverviewPage = () => {
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: cities = [] } = useInterviewCities();
  const { data: slotDays = [], isLoading: slotsLoading } = useUpcomingSlotDays();
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [weekStart, setWeekStart] = useState<Dayjs>(() => dayjs().subtract(FUNNEL_DEFAULT_OFFSET_DAYS, 'day'));

  const filteredCandidates = filterCandidates(candidates, filters);
  const funnel = FUNNEL_STEPS.map(step => {
    const count = filteredCandidates.filter(step.matches).length;

    return { label: step.label, count, percent: toPercent(count, filteredCandidates.length) };
  });
  const signupsByCity = cities.map(city => {
    const count = filteredCandidates.filter(candidate => candidate.interviewCity === city.key).length;

    return { city, count, percent: toPercent(count, filteredCandidates.length) };
  });
  const channelFunnel = buildChannelFunnel(filteredCandidates, toIsoDate(weekStart));
  const upcomingDays = slotDays.filter(day => !filters.cityKey || day.cityKey === filters.cityKey);

  const channelColumns: TableColumnsType<ChannelFunnelRow> = [
    { title: 'Channel', key: 'source', render: (_, row) => SOURCE_LABEL[row.source] },
    { title: 'Signups', dataIndex: 'signups', key: 'signups' },
    { title: 'Singapore number', dataIndex: 'withSingaporePhone', key: 'withSingaporePhone' },
    { title: 'Verified', dataIndex: 'verified', key: 'verified' },
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
          <div>{findCity(cities, day.cityKey)?.name ?? day.cityKey}</div>
          <div className="muted small">{findCity(cities, day.cityKey)?.centre}</div>
        </>
      ),
    },
    { title: 'Slots left today', dataIndex: 'slots', key: 'slots' },
    { title: 'Booked / capacity', key: 'booked', render: (_, day) => `${day.booked} / ${day.capacity}` },
  ];

  return (
    <>
      <PageHeader title={OVERVIEW_PAGE.title} subtitle={OVERVIEW_PAGE.subtitle} />
      <Flex vertical gap={18}>
        <Card>
          <Flex gap={12} wrap align="center" justify="space-between">
            <PartnerFilters value={filters} onChange={setFilters} />
            <Link to={ADMIN_PARTNERS_PATH}>{OVERVIEW_PAGE.partnersLink}</Link>
          </Flex>
        </Card>

        <Row gutter={[18, 18]}>
          {OVERVIEW_STATS.map(stat => (
            <Col xs={24} sm={12} xl={{ flex: '20%' }} key={stat.label}>
              <StatTile label={stat.label} value={filteredCandidates.filter(stat.matches).length} hint={stat.hint} to={stat.to} />
            </Col>
          ))}
        </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} lg={15}>
            <Card title="Recruitment funnel" style={{ height: '100%' }}>
              <Flex vertical gap={6}>
                {funnel.map(step => (
                  <div key={step.label} className="admin-funnel-row">
                    <span>{step.label}</span>
                    <Progress percent={step.percent} status="normal" showInfo={false} size={{ height: FUNNEL_BAR_HEIGHT }} />
                    <span className="admin-funnel-count">
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
                  <Flex key={item.city.key} justify="space-between" align="center" className="admin-geo-tile">
                    <span>{item.city.name}</span>
                    <Flex align="baseline" gap={6}>
                      <span className="admin-geo-count">{item.count}</span>
                      <span className="muted small">{item.percent}%</span>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Col>
        </Row>

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
          <Notice>Signup cohort for the selected week; conversion = verified / signups.</Notice>
          <Table
            rowKey="source"
            columns={channelColumns}
            dataSource={channelFunnel}
            loading={isLoading}
            pagination={false}
            scroll={TABLE_SCROLL}
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
            scroll={TABLE_SCROLL}
            locale={{ emptyText: 'No upcoming slots.' }}
          />
        </Card>
      </Flex>
    </>
  );
};
