import { Button, Card, Flex, Form, Input, Modal, Select, Table, TableColumnsType, Tag, Typography } from 'antd';
import { useState } from 'react';
import { assignCandidateToRecruiter, markCandidateJoined, updateSingaporePhone } from '@/api/candidates';
import { useCandidates, useInterviewCities, useRecruiters, useReservations } from '@/api/hooks';
import { CandidateFilters } from '@/api/interface';
import { PARTNER_STATE_TAG, SINGAPORE_PHONE_PATTERN, SOURCE_LABEL } from '@/domain/constant';
import { Candidate, PartnerState } from '@/domain/interface';
import { isLockActive } from '@/domain/reservation';
import { findCity, formatSlotDay, formatSlotTime, parseSlotId } from '@/domain/slot';
import { TABLE_PAGINATION, TABLE_SCROLL } from '@/shared/components/constant';
import { FilterSelect, Notice, PageHeader, SearchBox } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { matchesSearch } from '@/shared/utils/search';
import { PartnerFilters } from '../components/PartnerFilters';
import {
  ADMIN_MESSAGE,
  CANDIDATE_COLUMN_WIDTH,
  EMPTY_VALUE,
  LIST_FILTER,
  NOT_SCHEDULED,
  PARTNERS_PAGE,
  REGISTERED_BY_LABEL,
  SINGAPORE_PHONE_NOTE,
  SINGAPORE_PHONE_RULE_MESSAGE,
  TAG_RECRUITER,
} from '../constant';
import {
  SingaporePhoneFormValues,
  SingaporePhoneVariables,
  TagRecruiterFormValues,
  TagRecruiterVariables,
  TrackerRow,
} from '../interface';
import { filterCandidates, lockRecruiterOptions } from '../utils';

export const PartnersPage = () => {
  const [phoneForm] = Form.useForm<SingaporePhoneFormValues>();
  const [tagForm] = Form.useForm<TagRecruiterFormValues>();
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: cities = [] } = useInterviewCities();
  const { data: reservations = [], dataUpdatedAt: locksUpdatedAt } = useReservations();
  const { data: recruiters = [] } = useRecruiters();
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [search, setSearch] = useState('');
  const [recruiterId, setRecruiterId] = useState<string>();
  const [editing, setEditing] = useState<Candidate>();
  const [tagging, setTagging] = useState<Candidate>();
  const savePhone = useAppMutation(
    ({ candidateId, singaporePhone }: SingaporePhoneVariables) => updateSingaporePhone(candidateId, singaporePhone),
    ADMIN_MESSAGE.singaporePhoneSaved,
  );
  const tagRecruiter = useAppMutation(
    ({ candidateId, recruiterId }: TagRecruiterVariables) => assignCandidateToRecruiter(candidateId, recruiterId),
    ADMIN_MESSAGE.recruiterTagged,
  );
  const markJoined = useAppMutation(markCandidateJoined, ADMIN_MESSAGE.joinedSaved);

  const rows: TrackerRow[] = filterCandidates(candidates, filters)
    .map(candidate => {
      return {
        candidate,
        slot: candidate.slotId ? parseSlotId(candidate.slotId, findCity(cities, candidate.interviewCity)?.timeZone) : undefined,
        reservation: reservations.find(item => item.candidateId === candidate.id),
      };
    })
    .filter(({ reservation }) => !recruiterId || reservation?.recruiterId === recruiterId)
    .filter(({ candidate, reservation }) =>
      matchesSearch(search, [
        candidate.name,
        candidate.primaryPhone,
        candidate.singaporePhone,
        candidate.hubName,
        candidate.registeredBy?.name,
        reservation?.recruiterName,
        reservation?.recruiterCompany,
      ]),
    )
    .toSorted((a, b) => b.candidate.createdAt.localeCompare(a.candidate.createdAt));

  const trackerColumns: TableColumnsType<TrackerRow> = [
    {
      title: 'Candidate',
      key: 'candidate',
      width: CANDIDATE_COLUMN_WIDTH,
      render: (_, { candidate }) => (
        <>
          <Typography.Text strong className="nowrap">
            {candidate.name}
          </Typography.Text>
          <div className="muted small">{SOURCE_LABEL[candidate.source]}</div>
          {candidate.registeredBy && (
            <div className="muted small">
              {REGISTERED_BY_LABEL} {candidate.registeredBy.name} · {candidate.registeredBy.company}
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Interview city / slot',
      key: 'slot',
      render: (_, { candidate, slot }) => (
        <>
          <div>{findCity(cities, candidate.interviewCity)?.name ?? candidate.interviewCity}</div>
          {slot ? (
            <>
              <div className="muted small nowrap">{formatSlotDay(slot)}</div>
              <div className="muted small nowrap">{formatSlotTime(slot)}</div>
            </>
          ) : (
            <div className="muted small">{NOT_SCHEDULED}</div>
          )}
        </>
      ),
    },
    {
      title: PARTNERS_PAGE.phonesColumn,
      key: 'phones',
      render: (_, { candidate }) => (
        <>
          <div className="nowrap">{candidate.primaryPhone}</div>
          <Flex align="center" gap={6} className="muted small nowrap">
            <span>{`${PARTNERS_PAGE.singaporePhonePrefix} ${candidate.singaporePhone ?? EMPTY_VALUE}`}</span>
            {candidate.state !== PartnerState.VerificationFailed && (
              <Button
                size="small"
                aria-label={`${candidate.singaporePhone ? 'Edit' : 'Add'} Singapore number for ${candidate.name}`}
                onClick={() => setEditing(candidate)}
              >
                {candidate.singaporePhone ? 'Edit' : 'Add'}
              </Button>
            )}
          </Flex>
        </>
      ),
    },
    {
      title: 'Status',
      key: 'state',
      render: (_, { candidate, reservation }) => (
        <Flex vertical align="flex-start" gap={8}>
          <Tag color={PARTNER_STATE_TAG[candidate.state].color}>{PARTNER_STATE_TAG[candidate.state].label}</Tag>
          {candidate.state === PartnerState.Placed && (
            <Button
              size="small"
              aria-label={`Mark ${candidate.name} as joined`}
              loading={markJoined.isPending && markJoined.variables === candidate.id}
              onClick={() => markJoined.mutate(candidate.id)}
            >
              Mark as joined
            </Button>
          )}
          {candidate.state === PartnerState.Verified && !(reservation && isLockActive(reservation, locksUpdatedAt)) && (
            <Button size="small" aria-label={`${TAG_RECRUITER.action}: ${candidate.name}`} onClick={() => setTagging(candidate)}>
              {TAG_RECRUITER.action}
            </Button>
          )}
        </Flex>
      ),
    },
    {
      title: 'Hub',
      key: 'hub',
      render: (_, { candidate }) => <span className={candidate.hubName ? undefined : 'muted'}>{candidate.hubName ?? EMPTY_VALUE}</span>,
    },
    {
      title: 'Recruiter',
      key: 'recruiter',
      render: (_, { reservation }) =>
        reservation ? (
          <>
            <div className="nowrap">{reservation.recruiterName}</div>
            <div className="muted small">{reservation.recruiterCompany}</div>
          </>
        ) : (
          <span className="muted">{EMPTY_VALUE}</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader title={PARTNERS_PAGE.title} subtitle={PARTNERS_PAGE.subtitle} />
      <Card
        title={PARTNERS_PAGE.listTitle}
        styles={{ body: { padding: 0 } }}
        extra={<SearchBox value={search} onChange={setSearch} placeholder={PARTNERS_PAGE.searchPlaceholder} label={PARTNERS_PAGE.searchLabel} />}
      >
        <div className="list-filters">
          <PartnerFilters value={filters} onChange={setFilters}>
            <FilterSelect
              label={LIST_FILTER.recruiterLabel}
              placeholder={LIST_FILTER.recruiterPlaceholder}
              value={recruiterId}
              options={lockRecruiterOptions(reservations)}
              onChange={setRecruiterId}
            />
          </PartnerFilters>
        </div>
        <Table
          rowKey={row => row.candidate.id}
          columns={trackerColumns}
          dataSource={rows}
          loading={isLoading}
          pagination={TABLE_PAGINATION}
          scroll={TABLE_SCROLL}
          locale={{ emptyText: PARTNERS_PAGE.listEmpty }}
        />
      </Card>

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
      <Modal
        open={Boolean(tagging)}
        title={tagging && TAG_RECRUITER.title(tagging.name)}
        okText={TAG_RECRUITER.submit}
        confirmLoading={tagRecruiter.isPending}
        destroyOnHidden
        onOk={() => tagForm.submit()}
        onCancel={() => setTagging(undefined)}
      >
        <Notice>{TAG_RECRUITER.note}</Notice>
        <Form
          form={tagForm}
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          onFinish={({ recruiterId }) => {
            if (!tagging) return;

            tagRecruiter.mutate({ candidateId: tagging.id, recruiterId }, { onSuccess: () => setTagging(undefined) });
          }}
        >
          <Form.Item name="recruiterId" label={TAG_RECRUITER.recruiterLabel} rules={[{ required: true, message: TAG_RECRUITER.recruiterError }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={TAG_RECRUITER.recruiterPlaceholder}
              options={recruiters
                .filter(recruiter => recruiter.active)
                .map(recruiter => ({ value: recruiter.id, label: `${recruiter.name} · ${recruiter.company}` }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
