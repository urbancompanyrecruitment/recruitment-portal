import { Button, Card, Empty, Flex, Table, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInterviewCities } from '@/api/hooks';
import { ReservedCandidate } from '@/api/interface';
import { PARTNER_STATE_OPTIONS, PARTNER_STATE_TAG } from '@/domain/constant';
import { formatDate, formatLocation } from '@/domain/format';
import { Candidate, PartnerState, ReservationStatus, UserRole } from '@/domain/interface';
import { formatLockStatus, getReservationStatus } from '@/domain/reservation';
import { findCity, formatSlot, parseSlotId } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/session';
import { TABLE_PAGINATION, TABLE_SCROLL } from '@/shared/components/constant';
import { CandidateAvatar, FilterSelect, PageHeader, SearchBox } from '@/shared/components/ui';
import { matchesSearch } from '@/shared/utils/search';
import { CANDIDATE_TABS, MY_CANDIDATES, RECRUITER_PATH, REGISTERED_PARTNERS, REGISTERED_STATUS_FILTER } from '../constant';
import { useMyReservations, useRegisteredCandidates } from '../hooks';
import { CandidateTab } from '../interface';

export const MyCandidatesPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const { data = [], isLoading, dataUpdatedAt } = useMyReservations(user.id);
  const registered = useRegisteredCandidates(user.id);
  const { data: cities = [] } = useInterviewCities();
  const [activeTab, setActiveTab] = useState<CandidateTab>(CandidateTab.All);
  const [search, setSearch] = useState('');
  const [registeredSearch, setRegisteredSearch] = useState('');
  const [registeredState, setRegisteredState] = useState<PartnerState>();

  const matching = data.filter(({ candidate, reservation }) =>
    matchesSearch(search, [candidate.name, candidate.nationality, candidate.city, candidate.country, reservation.employerName]),
  );
  const rowsByTab = Object.fromEntries(
    CANDIDATE_TABS.map(tab => [
      tab.key,
      matching.filter(({ reservation }) => !tab.status || getReservationStatus(reservation) === tab.status),
    ]),
  ) as Record<CandidateTab, ReservedCandidate[]>;
  const registeredRows = (registered.data ?? [])
    .filter(candidate => !registeredState || candidate.state === registeredState)
    .filter(candidate => matchesSearch(registeredSearch, [candidate.name, candidate.primaryPhone, candidate.singaporePhone]));

  return (
    <>
      <PageHeader title="My candidates" subtitle="Manage your locked profiles, confirmed placements and the candidates you registered." />
      <SearchBox value={search} onChange={setSearch} placeholder={MY_CANDIDATES.searchPlaceholder} label={MY_CANDIDATES.searchLabel} />
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
          rowKey={row => row.reservation.id}
          loading={isLoading}
          dataSource={rowsByTab[activeTab]}
          pagination={TABLE_PAGINATION}
          scroll={TABLE_SCROLL}
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
                    <div className="muted small">{candidate.nationality}</div>
                  </div>
                </Flex>
              ),
            },
            {
              key: 'location',
              title: 'Current location',
              render: (_, { candidate }) => formatLocation(candidate),
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
                reservation.employerName ?? <Typography.Text type="secondary">Not saved</Typography.Text>,
            },
            {
              key: 'status',
              title: 'Status',
              render: (_, { reservation }) =>
                getReservationStatus(reservation) === ReservationStatus.Placed ? (
                  <Tag color="success">Placed</Tag>
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
      <Card
        title={`${REGISTERED_PARTNERS.title} (${registered.data?.length ?? 0})`}
        styles={{ body: { padding: 0 } }}
        style={{ marginTop: 18 }}
        extra={<Link to={RECRUITER_PATH.registerPartner}>{REGISTERED_PARTNERS.register} →</Link>}
      >
        <Typography.Paragraph type="secondary" className="small recruiter-card-note">
          {REGISTERED_PARTNERS.note}
        </Typography.Paragraph>
        <Flex gap={12} wrap className="recruiter-card-note">
          <SearchBox
            value={registeredSearch}
            onChange={setRegisteredSearch}
            placeholder={REGISTERED_PARTNERS.searchPlaceholder}
            label={REGISTERED_PARTNERS.searchLabel}
          />
          <FilterSelect
            label={REGISTERED_STATUS_FILTER.label}
            placeholder={REGISTERED_STATUS_FILTER.placeholder}
            value={registeredState}
            options={PARTNER_STATE_OPTIONS}
            onChange={setRegisteredState}
          />
        </Flex>
        <Table<Candidate>
          rowKey="id"
          loading={registered.isLoading}
          dataSource={registeredRows}
          pagination={TABLE_PAGINATION}
          scroll={TABLE_SCROLL}
          locale={{ emptyText: registeredSearch.trim() || registeredState ? REGISTERED_PARTNERS.searchEmpty : REGISTERED_PARTNERS.empty }}
          columns={[
            { key: 'name', title: 'Candidate', render: (_, candidate) => <Typography.Text strong>{candidate.name}</Typography.Text> },
            { key: 'primaryPhone', title: 'Primary mobile', render: (_, candidate) => candidate.primaryPhone },
            {
              key: 'slot',
              title: 'Interview slot',
              render: (_, candidate) => {
                const slot = candidate.slotId
                  ? parseSlotId(candidate.slotId, findCity(cities, candidate.interviewCity)?.timeZone)
                  : undefined;

                return slot ? formatSlot(slot) : <Typography.Text type="secondary">Not scheduled</Typography.Text>;
              },
            },
            { key: 'registeredOn', title: 'Registered on', render: (_, candidate) => formatDate(candidate.createdAt) },
            {
              key: 'state',
              title: 'Status',
              render: (_, candidate) => (
                <Tag color={PARTNER_STATE_TAG[candidate.state].color}>{PARTNER_STATE_TAG[candidate.state].label}</Tag>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};
