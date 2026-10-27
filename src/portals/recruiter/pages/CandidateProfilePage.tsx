import { CopyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Result,
  Row,
  Select,
  Skeleton,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { QUERY_KEY } from '@/api/constant';
import { useAggregators } from '@/api/hooks';
import { PlacementInput } from '@/api/interface';
import { getReservedCandidate, savePlacement } from '@/api/reservations';
import { ASSESSMENT_STAGES, DATE_FORMAT, STAGE_LABEL } from '@/domain/constant';
import { formatDate, formatDateTime, toIsoDate } from '@/domain/format';
import { ReservationStatus, UserRole } from '@/domain/interface';
import { formatTimeLeft, getReservationStatus } from '@/domain/reservation';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, Notice, PageHeader, ResultTag, VerificationTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { RECRUITER_MESSAGE, RECRUITER_PATH, RESERVATION_REFETCH_MS, WHITESPACE } from '../constant';
import { PlacementFormValues } from '../interface';

export const CandidateProfilePage = () => {
  const { candidateId = '' } = useParams();
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const profile = useQuery({
    queryKey: QUERY_KEY.candidateProfile(candidateId, user.id),
    queryFn: () => getReservedCandidate(candidateId, user.id),
    refetchInterval: RESERVATION_REFETCH_MS,
  });
  const aggregators = useAggregators();
  const save = useAppMutation(
    (input: PlacementInput) => savePlacement(candidateId, user.id, input),
    RECRUITER_MESSAGE.placementSaved,
  );

  if (profile.error) {
    return (
      <Card>
        <Result
          status="warning"
          title="Profile unavailable"
          subTitle={profile.error.message}
          extra={
            <Button type="primary" onClick={() => navigate(RECRUITER_PATH.profiles)}>
              Browse available profiles
            </Button>
          }
        />
      </Card>
    );
  }

  if (!profile.data) return <Skeleton active />;

  const { candidate, reservation } = profile.data;
  const isAssigned = getReservationStatus(reservation) === ReservationStatus.AggregatorAssigned;
  const aggregatorName = aggregators.data?.find(aggregator => aggregator.id === reservation.aggregatorId)?.name;

  return (
    <>
      <PageHeader
        back={{ to: RECRUITER_PATH.myCandidates, label: 'Back to my candidates' }}
        title={candidate.name}
        subtitle="Contact the provider, then complete the start date and aggregator."
      />
      {isAssigned ? (
        <Notice tone="success">
          <strong>Aggregator assigned</strong> · Placement saved — UC hub information appears below when available.
        </Notice>
      ) : (
        <Notice>
          <strong>Reserved exclusively for your account</strong>
          <div>
            Assign an approved aggregator by {formatDateTime(reservation.deadlineAt)} ·{' '}
            {formatTimeLeft(reservation.deadlineAt, profile.dataUpdatedAt)}.
          </div>
          <div className="small">Sample 48-hour reservation; the business time limit is still to be confirmed.</div>
        </Notice>
      )}
      <Row gutter={[18, 18]}>
        <Col xs={24} lg={10}>
          <Card style={{ height: '100%' }}>
            <Flex justify="space-between" align="flex-start" gap={12}>
              <Flex align="center" gap={14}>
                <CandidateAvatar name={candidate.name} size={60} />
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {candidate.name}
                  </Typography.Title>
                  <div className="muted small">{candidate.category}</div>
                </div>
              </Flex>
              <VerificationTag verified={candidate.verified} />
            </Flex>
            <div className="recruiter-phone-box">
              <div className="muted small">Phone / WhatsApp</div>
              <Flex justify="space-between" align="center" gap={12} wrap>
                <a className="recruiter-phone-link" href={`tel:${candidate.phone.replace(WHITESPACE, '')}`}>
                  {candidate.phone}
                </a>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    Promise.resolve()
                      .then(() => navigator.clipboard.writeText(candidate.phone))
                      .then(() => message.success(RECRUITER_MESSAGE.phoneCopied))
                      .catch(() => message.error(RECRUITER_MESSAGE.phoneCopyFailed))
                  }
                >
                  Copy
                </Button>
              </Flex>
            </div>
            <Descriptions
              column={1}
              size="small"
              items={[
                { key: 'location', label: 'Current location', children: `${candidate.city}, ${candidate.country}` },
                { key: 'nationality', label: 'Nationality', children: candidate.nationality },
                { key: 'experience', label: 'Experience', children: `${candidate.yearsOfExperience} years` },
              ]}
            />
            <Typography.Paragraph style={{ margin: '14px 0 18px' }}>{candidate.bio}</Typography.Paragraph>
            <div className="recruiter-fact-label">UC assessment results</div>
            <Flex gap={6} wrap style={{ marginTop: 8 }}>
              {ASSESSMENT_STAGES.map(stage => (
                <ResultTag key={stage} result={candidate.results[stage]} label={STAGE_LABEL[stage]} />
              ))}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Contact & placement" style={{ height: '100%' }}>
            <Typography.Paragraph type="secondary">
              Please contact the candidate and fill in the required details.
            </Typography.Paragraph>
            <Form<PlacementFormValues>
              key={candidate.id}
              layout="vertical"
              initialValues={{
                startDate: reservation.startDate ? dayjs(reservation.startDate) : undefined,
                aggregatorId: reservation.aggregatorId,
              }}
              onFinish={values =>
                save.mutate({ startDate: toIsoDate(values.startDate), aggregatorId: values.aggregatorId })
              }
            >
              <Form.Item
                name="startDate"
                label="Planned joining / start date"
                extra="Confirm this date with the provider before saving."
                rules={[{ required: true, message: 'Select the planned start date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format={DATE_FORMAT}
                  disabledDate={date => date.isBefore(dayjs(), 'day')}
                />
              </Form.Item>
              <Form.Item
                name="aggregatorId"
                label="UC-linked aggregator / employer"
                extra="The company under which the work permit will be processed."
                rules={[{ required: true, message: 'Select an approved aggregator' }]}
              >
                <Select
                  placeholder="Select an approved aggregator"
                  loading={aggregators.isLoading}
                  options={aggregators.data?.map(aggregator => ({ value: aggregator.id, label: aggregator.name }))}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={save.isPending}>
                {isAssigned ? 'Update placement' : 'Save placement ✓'}
              </Button>
            </Form>
            {isAssigned ? (
              <div className="recruiter-hub-panel">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {reservation.hub ? 'Hub & joining instructions' : 'Hub allocation pending'}
                </Typography.Title>
                <Descriptions
                  column={1}
                  size="small"
                  items={[
                    { key: 'joining', label: 'Joining date', children: formatDate(reservation.startDate) },
                    { key: 'aggregator', label: 'Aggregator', children: aggregatorName ?? '—' },
                    { key: 'area', label: 'Assigned area', children: reservation.hub ?? 'To be updated by UC' },
                  ]}
                />
                <Typography.Paragraph style={{ margin: '12px 0 8px' }}>
                  {reservation.hubInstructions ?? 'UC will update the assigned hub and stay-location instructions.'}
                </Typography.Paragraph>
                <div className="small muted">
                  Recruiters cannot edit the hub allocation. Hub updates are shared two weeks before joining.
                </div>
              </div>
            ) : (
              <Typography.Paragraph type="secondary" className="small" style={{ margin: '24px 0 0' }}>
                Opening or contacting the provider alone does not stop expiry. Assign an approved aggregator before the
                deadline.
              </Typography.Paragraph>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};
