import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, Form, Input, Modal, Row, Select, Table, TableColumnsType, Tag, Typography, Upload } from 'antd';
import { useState } from 'react';
import {
  assignCandidateToRecruiter,
  exportCandidatesCsv,
  exportOpsLeadUploadCsv,
  importHubs,
  importVerifiedCandidates,
  markCandidateJoined,
  updateSingaporePhone,
} from '@/api/candidates';
import { useCandidates, useInterviewCities, useRecruiters, useReservations } from '@/api/hooks';
import { CandidateFilters, HubImportResult, HubImportRow, ImportRow, VerifiedImportResult } from '@/api/interface';
import { PARTNER_STATE_TAG, SINGAPORE_PHONE_PATTERN, SOURCE_LABEL } from '@/domain/constant';
import { Candidate, HubRowOutcome, PartnerState } from '@/domain/interface';
import { isLockActive } from '@/domain/reservation';
import { findCity, formatSlot, parseSlotId } from '@/domain/slot';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { downloadCsv, downloadTextFile, parseCsvRecords } from '@/shared/utils/csv';
import { CsvFileCard } from '../components/CsvFileCard';
import { PartnerFilters } from '../components/PartnerFilters';
import { SlotUpload } from '../components/SlotUpload';
import {
  ADMIN_MESSAGE,
  CSV_FILES,
  EMPTY_VALUE,
  FAIL_CSV_FILE_NAME,
  FAIL_CSV_HEADERS,
  HUB_CSV_HEADERS,
  HUB_FAIL_CSV_FILE_NAME,
  HUB_FAIL_CSV_HEADERS,
  HUB_OUTCOME_LABEL,
  IMPORT_OUTCOME_LABEL,
  NOT_SCHEDULED,
  OPS_UPLOAD_FILE_NAME,
  PARTNERS_PAGE,
  PROCESSED_IMPORT_OUTCOMES,
  REGISTERED_BY_LABEL,
  SIGNUP_EXPORT_FILE_NAME,
  SINGAPORE_PHONE_NOTE,
  SINGAPORE_PHONE_RULE_MESSAGE,
  TABLE_PAGE_SIZE,
  TAG_RECRUITER,
  VERIFIED_CSV_HEADERS,
} from '../constant';
import {
  HubImportVariables,
  ImportVariables,
  SingaporePhoneFormValues,
  SingaporePhoneVariables,
  TagRecruiterFormValues,
  TagRecruiterVariables,
  TrackerRow,
} from '../interface';
import { filterCandidates } from '../utils';

export const PartnersPage = () => {
  const [phoneForm] = Form.useForm<SingaporePhoneFormValues>();
  const [tagForm] = Form.useForm<TagRecruiterFormValues>();
  const { data: candidates = [], isLoading } = useCandidates();
  const { data: cities = [] } = useInterviewCities();
  const { data: reservations = [], dataUpdatedAt: locksUpdatedAt } = useReservations();
  const { data: recruiters = [] } = useRecruiters();
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [editing, setEditing] = useState<Candidate>();
  const [importResult, setImportResult] = useState<VerifiedImportResult>();
  const [hubResult, setHubResult] = useState<HubImportResult>();
  const [tagging, setTagging] = useState<Candidate>();
  const savePhone = useAppMutation(
    ({ candidateId, singaporePhone }: SingaporePhoneVariables) => updateSingaporePhone(candidateId, singaporePhone),
    ADMIN_MESSAGE.singaporePhoneSaved,
  );
  const importVerified = useAppMutation(
    ({ rows, fileName }: ImportVariables) => importVerifiedCandidates(rows, fileName),
    ADMIN_MESSAGE.importCompleted,
  );
  const importHubNames = useAppMutation(
    ({ rows, fileName }: HubImportVariables) => importHubs(rows, fileName),
    ADMIN_MESSAGE.hubImportCompleted,
  );
  const tagRecruiter = useAppMutation(
    ({ candidateId, recruiterId }: TagRecruiterVariables) => assignCandidateToRecruiter(candidateId, recruiterId),
    ADMIN_MESSAGE.recruiterTagged,
  );
  const markJoined = useAppMutation(markCandidateJoined, ADMIN_MESSAGE.joinedSaved);
  const exportSignedUp = useAppMutation(() => exportCandidatesCsv(filters));
  const exportOpsUpload = useAppMutation(() => exportOpsLeadUploadCsv(filters));

  const rows: TrackerRow[] = filterCandidates(candidates, filters)
    .map(candidate => {
      const slot = candidate.slotId ? parseSlotId(candidate.slotId, findCity(cities, candidate.interviewCity)?.timeZone) : undefined;

      return {
        candidate,
        slotLabel: slot ? formatSlot(slot) : NOT_SCHEDULED,
        reservation: reservations.find(item => item.candidateId === candidate.id),
      };
    })
    .toSorted((a, b) => b.candidate.createdAt.localeCompare(a.candidate.createdAt));
  const opsUploadCount = rows.filter(
    ({ candidate }) => candidate.hasSingaporePhone && candidate.state !== PartnerState.VerificationFailed,
  ).length;
  const failedRows = importResult?.rows.filter(row => !PROCESSED_IMPORT_OUTCOMES.includes(row.outcome)) ?? [];
  const hubFailedRows = hubResult?.rows.filter(row => row.outcome !== HubRowOutcome.Updated) ?? [];

  const trackerColumns: TableColumnsType<TrackerRow> = [
    {
      title: 'Provider',
      key: 'provider',
      render: (_, { candidate }) => (
        <>
          <Typography.Text strong>{candidate.name}</Typography.Text>
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
      render: (_, { candidate, slotLabel }) => (
        <>
          <div>{findCity(cities, candidate.interviewCity)?.name ?? candidate.interviewCity}</div>
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
      title: 'Status',
      key: 'state',
      render: (_, { candidate }) => (
        <Tag color={PARTNER_STATE_TAG[candidate.state].color}>{PARTNER_STATE_TAG[candidate.state].label}</Tag>
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
      fixed: 'right',
      render: (_, { candidate, reservation }) => (
        <Flex gap={6} justify="flex-end">
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
  ];

  const failedColumns: TableColumnsType<ImportRow> = [
    { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
    { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
    { title: 'Verified', dataIndex: 'verified', key: 'verified' },
    { title: 'Reason', key: 'reason', render: (_, row) => IMPORT_OUTCOME_LABEL[row.outcome] },
  ];

  const hubFailedColumns: TableColumnsType<HubImportRow> = [
    { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 80 },
    { title: 'Primary mobile', dataIndex: 'primaryPhone', key: 'primaryPhone' },
    { title: 'Hub name', dataIndex: 'hubName', key: 'hubName' },
    { title: 'Reason', key: 'reason', render: (_, row) => HUB_OUTCOME_LABEL[row.outcome] },
  ];

  return (
    <>
      <PageHeader title={PARTNERS_PAGE.title} subtitle={PARTNERS_PAGE.subtitle} />
      <Flex vertical gap={18}>
        <Card>
          <PartnerFilters value={filters} onChange={setFilters} />
          <Typography.Paragraph type="secondary" className="small" style={{ margin: '12px 0 0' }}>
            {PARTNERS_PAGE.filtersNote}
          </Typography.Paragraph>
        </Card>

        <Typography.Title level={4} style={{ margin: 0 }}>
          {PARTNERS_PAGE.filesTitle}
        </Typography.Title>
        <Row gutter={[18, 18]}>
          <Col xs={24} lg={12}>
            <CsvFileCard guide={CSV_FILES.signedUp} summary={PARTNERS_PAGE.signedUpSummary(rows.length)}>
              <Button
                icon={<DownloadOutlined />}
                disabled={!rows.length}
                loading={exportSignedUp.isPending}
                onClick={() =>
                  exportSignedUp.mutate(undefined, { onSuccess: csv => downloadTextFile(csv, SIGNUP_EXPORT_FILE_NAME) })
                }
              >
                {CSV_FILES.signedUp.action}
              </Button>
            </CsvFileCard>
          </Col>
          <Col xs={24} lg={12}>
            <CsvFileCard guide={CSV_FILES.opsUpload} summary={PARTNERS_PAGE.opsUploadSummary(opsUploadCount, rows.length)}>
              <Button
                icon={<DownloadOutlined />}
                disabled={!opsUploadCount}
                loading={exportOpsUpload.isPending}
                onClick={() =>
                  exportOpsUpload.mutate(undefined, { onSuccess: csv => downloadTextFile(csv, OPS_UPLOAD_FILE_NAME) })
                }
              >
                {CSV_FILES.opsUpload.action}
              </Button>
            </CsvFileCard>
          </Col>
          <Col xs={24} lg={12}>
            <CsvFileCard guide={CSV_FILES.verified}>
              <Upload
                accept=".csv,text/csv"
                showUploadList={false}
                beforeUpload={file => {
                  file
                    .text()
                    .then(text =>
                      importVerified.mutate(
                        {
                          rows: parseCsvRecords(text, VERIFIED_CSV_HEADERS).map(row => ({
                            primaryPhone: row.primary_mobile,
                            verified: row.verified,
                          })),
                          fileName: file.name,
                        },
                        { onSuccess: setImportResult },
                      ),
                    );

                  return false;
                }}
              >
                <Button icon={<UploadOutlined />} loading={importVerified.isPending}>
                  {CSV_FILES.verified.action}
                </Button>
              </Upload>
            </CsvFileCard>
          </Col>
          <Col xs={24} lg={12}>
            <CsvFileCard guide={CSV_FILES.hubs}>
              <Upload
                accept=".csv,text/csv"
                showUploadList={false}
                beforeUpload={file => {
                  file
                    .text()
                    .then(text =>
                      importHubNames.mutate(
                        {
                          rows: parseCsvRecords(text, HUB_CSV_HEADERS).map(row => ({
                            primaryPhone: row.primary_mobile,
                            hubName: row.hub_name,
                          })),
                          fileName: file.name,
                        },
                        { onSuccess: setHubResult },
                      ),
                    );

                  return false;
                }}
              >
                <Button icon={<UploadOutlined />} loading={importHubNames.isPending}>
                  {CSV_FILES.hubs.action}
                </Button>
              </Upload>
            </CsvFileCard>
          </Col>
        </Row>

        <SlotUpload />

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
                        ...failedRows.map(row => [row.rowNumber, row.primaryPhone, row.verified, IMPORT_OUTCOME_LABEL[row.outcome]]),
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
              title={`${importResult.counts.accepted} verified, ${importResult.counts.rejected} marked as verification failed, ${importResult.counts.errors} not applied out of ${importResult.counts.rows} rows.`}
              style={{ marginBottom: failedRows.length ? 16 : 0 }}
            />
            {failedRows.length > 0 && (
              <Table rowKey="rowNumber" columns={failedColumns} dataSource={failedRows} pagination={false} size="small" />
            )}
          </Card>
        )}

        {hubResult && (
          <Card
            title={`Hub list: ${hubResult.fileName}`}
            extra={
              hubFailedRows.length ? (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    downloadCsv(
                      [
                        HUB_FAIL_CSV_HEADERS,
                        ...hubFailedRows.map(row => [row.rowNumber, row.primaryPhone, row.hubName, HUB_OUTCOME_LABEL[row.outcome]]),
                      ],
                      HUB_FAIL_CSV_FILE_NAME,
                    )
                  }
                >
                  Download hub fail CSV
                </Button>
              ) : null
            }
          >
            <Alert
              type={hubFailedRows.length ? 'warning' : 'success'}
              showIcon
              title={`${hubResult.counts.updated} ${hubResult.counts.updated === 1 ? 'hub' : 'hubs'} updated, ${hubResult.counts.errors} not applied out of ${hubResult.counts.rows} rows.`}
              style={{ marginBottom: hubFailedRows.length ? 16 : 0 }}
            />
            {hubFailedRows.length > 0 && (
              <Table rowKey="rowNumber" columns={hubFailedColumns} dataSource={hubFailedRows} pagination={false} size="small" />
            )}
          </Card>
        )}

        <Card title={PARTNERS_PAGE.listTitle} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey={row => row.candidate.id}
            columns={trackerColumns}
            dataSource={rows}
            loading={isLoading}
            pagination={{ pageSize: TABLE_PAGE_SIZE, hideOnSinglePage: true }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: PARTNERS_PAGE.listEmpty }}
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
