import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Select, Table, TableColumnsType, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCandidates, useSlots, useTrainers } from '@/api/hooks';
import { getCurrentStage } from '@/domain/assessment';
import { ASSESSMENT_STAGES, STAGE_LABEL } from '@/domain/constant';
import { formatDate, formatDateTime } from '@/domain/format';
import { StageResult, UserRole } from '@/domain/interface';
import { formatSlot } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { PageHeader, ResultTag, VerificationTag } from '@/shared/components/ui';
import { downloadCsv } from '@/shared/utils/csv';
import {
  CANDIDATE_PAGE_SIZE,
  CANDIDATE_STATUS_TABS,
  CSV_FILE_NAME,
  CSV_HEADERS,
  CSV_NOTE_SEPARATOR,
  NO,
  NOT_SCHEDULED,
  PROGRESS_OPTIONS,
  RESULT_OPTIONS,
  TRAINER_PATH,
  UNASSIGNED,
  YES,
} from '../constant';
import {
  CandidateFilterField,
  CandidateFilters,
  CandidateMilestone,
  CandidateRow,
  CandidateStatusTab,
  ListRedirectState,
} from '../interface';

export const CandidatesPage = () => {
  const user = useSessionUser(UserRole.Trainer);
  const location = useLocation();
  const candidates = useCandidates(user.geography);
  const slots = useSlots();
  const trainers = useTrainers();
  const [status, setStatus] = useState(CandidateStatusTab.All);
  const [filters, setFilters] = useState<CandidateFilters>({});

  const redirectError = (location.state as ListRedirectState | null)?.error;
  const geographySlots = (slots.data ?? []).filter(slot => slot.geography === user.geography);
  const activeTab = CANDIDATE_STATUS_TABS.find(tab => tab.value === status) ?? CANDIDATE_STATUS_TABS[0];

  const rows: CandidateRow[] = (candidates.data ?? []).map(candidate => {
    const slot = slots.data?.find(item => item.id === candidate.slotId);
    const currentStage = getCurrentStage(candidate.results);
    return {
      candidate,
      slot,
      trainerName: trainers.data?.find(trainer => trainer.id === slot?.trainerId)?.name,
      progress: candidate.verified ? CandidateMilestone.Verified : (currentStage ?? CandidateMilestone.ReadyToVerify),
      currentResult: currentStage ? candidate.results[currentStage] : StageResult.Passed,
    };
  });

  const visibleRows = rows
    .filter(row => activeTab.matches(row.candidate))
    .filter(row => !filters.interviewDate || row.slot?.date === filters.interviewDate)
    .filter(row => !filters.trainerId || row.slot?.trainerId === filters.trainerId)
    .filter(row => !filters.progress || row.progress === filters.progress)
    .filter(row => !filters.result || row.currentResult === filters.result);

  const filterFields: CandidateFilterField[] = [
    {
      key: 'interviewDate',
      placeholder: 'Interview date',
      options: [...new Set(geographySlots.map(slot => slot.date))].map(date => ({
        value: date,
        label: formatDate(date),
      })),
    },
    {
      key: 'trainerId',
      placeholder: 'Assigned trainer',
      options: (trainers.data ?? [])
        .filter(trainer => trainer.geography === user.geography)
        .map(trainer => ({ value: trainer.id, label: trainer.name })),
    },
    { key: 'progress', placeholder: 'Assessment stage', options: PROGRESS_OPTIONS },
    { key: 'result', placeholder: 'Result', options: RESULT_OPTIONS },
  ];

  const columns: TableColumnsType<CandidateRow> = [
    {
      title: 'Professional',
      key: 'professional',
      render: (_, { candidate }) => (
        <div>
          <Typography.Text strong>{candidate.name}</Typography.Text>
          <div className="muted small">
            {candidate.city}, {candidate.country}
          </div>
          <div className="muted small">{candidate.phone}</div>
        </div>
      ),
    },
    {
      title: 'Interview',
      key: 'interview',
      render: (_, { slot }) =>
        slot ? (
          <>
            {formatDate(slot.date, NOT_SCHEDULED)}
            <br />
            <Typography.Text type="secondary" className="small">
              {slot.time} · {slot.timeZone}
            </Typography.Text>
          </>
        ) : (
          NOT_SCHEDULED
        ),
    },
    { title: 'Assigned trainer', key: 'trainer', render: (_, { trainerName }) => trainerName ?? UNASSIGNED },
    ...ASSESSMENT_STAGES.map(stage => ({
      title: STAGE_LABEL[stage],
      key: stage,
      render: (_: unknown, { candidate }: CandidateRow) => <ResultTag result={candidate.results[stage]} />,
    })),
    {
      title: 'Verification',
      key: 'verification',
      render: (_, { candidate }) => <VerificationTag verified={candidate.verified} />,
    },
    {
      key: 'review',
      align: 'right',
      render: (_, { candidate }) => <Link to={TRAINER_PATH.candidate(candidate.id)}>Review →</Link>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Trainer dashboard"
        subtitle={`${user.name} · ${user.geography} candidates only. Review L1–L3 and confirm UC verification.`}
        extra={
          <Button
            icon={<DownloadOutlined />}
            disabled={!visibleRows.length}
            onClick={() =>
              downloadCsv(
                [
                  CSV_HEADERS,
                  ...visibleRows.map(({ candidate, slot, trainerName }) => [
                    candidate.name,
                    candidate.phone,
                    candidate.country,
                    candidate.city,
                    candidate.interviewGeography,
                    slot ? formatSlot(slot) : NOT_SCHEDULED,
                    trainerName ?? UNASSIGNED,
                    ...ASSESSMENT_STAGES.map(stage => candidate.results[stage]),
                    candidate.verified ? YES : NO,
                    candidate.category,
                    candidate.notes
                      .map(note => `${note.by} ${formatDateTime(note.at)}: ${note.text}`)
                      .join(CSV_NOTE_SEPARATOR),
                  ]),
                ],
                CSV_FILE_NAME,
              )
            }
          >
            Download Excel (CSV)
          </Button>
        }
      />
      {redirectError && <Alert type="error" title={redirectError} showIcon closable style={{ marginBottom: 20 }} />}
      <Card styles={{ body: { padding: 0 } }}>
        <div className="trainer-toolbar">
          <Tabs
            activeKey={status}
            onChange={key => setStatus(key as CandidateStatusTab)}
            items={CANDIDATE_STATUS_TABS.map(tab => ({
              key: tab.value,
              label: `${tab.label} (${rows.filter(row => tab.matches(row.candidate)).length})`,
            }))}
          />
          <Flex gap={10} wrap align="center">
            {filterFields.map(field => (
              <Select
                key={field.key}
                allowClear
                aria-label={field.placeholder}
                placeholder={field.placeholder}
                value={filters[field.key]}
                options={field.options}
                onChange={value => setFilters(current => ({ ...current, [field.key]: value }))}
                className="trainer-filter"
              />
            ))}
            <Button type="link" disabled={!Object.values(filters).some(Boolean)} onClick={() => setFilters({})}>
              Clear filters
            </Button>
          </Flex>
        </div>
        <Table
          rowKey={row => row.candidate.id}
          columns={columns}
          dataSource={visibleRows}
          loading={candidates.isLoading || slots.isLoading || trainers.isLoading}
          pagination={{ pageSize: CANDIDATE_PAGE_SIZE, hideOnSinglePage: true, showSizeChanger: false }}
          locale={{ emptyText: 'No candidates match these filters.' }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </>
  );
};
