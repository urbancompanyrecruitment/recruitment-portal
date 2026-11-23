import { CopyOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Popconfirm,
  Result,
  Row,
  Select,
  Skeleton,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { QUERY_KEY } from '@/api/constant';
import { PlacementInput } from '@/api/interface';
import { getReservedCandidate, releaseReservation, savePlacement } from '@/api/reservations';
import { COOKING_FREQUENCY_LABEL, DATE_FORMAT } from '@/domain/constant';
import { formatDate, formatDateTime, formatLocation, toIsoDate } from '@/domain/format';
import { ReservationStatus, UserRole } from '@/domain/interface';
import { formatLockStatus, getReservationStatus } from '@/domain/reservation';
import { useSessionUser } from '@/shared/auth/session';
import { CandidateAvatar, Notice, PageHeader, VerificationTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import {
  LOCK_NOTE,
  NO_EXPIRY_LOCK,
  PLACEMENT_FINAL_NOTE,
  PLACEMENT_FORM,
  RECRUITER_MESSAGE,
  RECRUITER_PATH,
  WHITESPACE,
} from '../constant';
import { useMyAggregators } from '../hooks';
import { PlacementFormValues } from '../interface';

const yesNo = (value: boolean) => (value ? 'Yes' : 'No');

export const CandidateProfilePage = () => {
  const { candidateId = '' } = useParams();
  const user = useSessionUser(UserRole.Recruiter);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const profile = useQuery({
    queryKey: QUERY_KEY.candidateProfile(candidateId, user.id),
    queryFn: () => getReservedCandidate(candidateId),
  });
  const aggregators = useMyAggregators(user.id);
  const save = useAppMutation((input: PlacementInput) => savePlacement(candidateId, input), RECRUITER_MESSAGE.placementSaved);
  const release = useAppMutation(() => releaseReservation(candidateId), RECRUITER_MESSAGE.released);

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
  const isPlaced = getReservationStatus(reservation) === ReservationStatus.Placed;
  const noAggregators = aggregators.data?.length === 0;

  return (
    <>
      <PageHeader
        back={{ to: RECRUITER_PATH.myCandidates, label: 'Back to my candidates' }}
        title={candidate.name}
        subtitle="Contact the partner, then save the aggregator and start date."
      />
      {isPlaced && (
        <Notice tone="success">
          <strong>Placed</strong> · Placement saved on {formatDate(reservation.placementRecordedAt ? dayjs(reservation.placementRecordedAt).toISOString() : undefined)}.
          The business team will track the joining.
        </Notice>
      )}
      {!isPlaced && reservation.lockReleaseAt === undefined && (
        <Notice>
          <strong>{NO_EXPIRY_LOCK.title}</strong>
          <div className="small">{NO_EXPIRY_LOCK.note}</div>
        </Notice>
      )}
      {!isPlaced && reservation.lockReleaseAt !== undefined && (
        <Notice>
          <strong>Locked exclusively for your account</strong>
          <div>
            Save the placement by {formatDateTime(reservation.lockReleaseAt)} · {formatLockStatus(reservation, profile.dataUpdatedAt)}.
          </div>
          <div className="small">{LOCK_NOTE}</div>
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
                  <div className="muted small">{candidate.nationality}</div>
                </div>
              </Flex>
              <VerificationTag verified={candidate.verified} />
            </Flex>
            <div className="recruiter-phone-box">
              <div className="muted small">Primary mobile / WhatsApp</div>
              <Flex justify="space-between" align="center" gap={12} wrap>
                <a className="recruiter-phone-link" href={`tel:${(candidate.primaryPhone ?? '').replace(WHITESPACE, '')}`}>
                  {candidate.primaryPhone}
                </a>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    Promise.resolve()
                      .then(() => navigator.clipboard.writeText(candidate.primaryPhone ?? ''))
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
                { key: 'singapore', label: 'Singapore mobile', children: candidate.singaporePhone ?? 'Not shared yet' },
                { key: 'location', label: 'Current location', children: formatLocation(candidate) },
                { key: 'age', label: 'Age', children: `${candidate.age} years` },
                { key: 'cooking', label: 'Cooking in previous work', children: COOKING_FREQUENCY_LABEL[candidate.cookingFrequency] },
                { key: 'deep', label: 'Deep-cleaning experience', children: yesNo(candidate.deepCleaningExperience) },
                { key: 'dogs', label: 'Comfortable around dogs', children: yesNo(candidate.comfortableWithDogs) },
              ]}
            />
            <div className="recruiter-fact-label" style={{ marginTop: 14 }}>
              UC verification
            </div>
            <div className="small" style={{ marginTop: 8 }}>
              {candidate.verifiedAt ? `Verified on ${formatDate(candidate.verifiedAt)}` : 'Not verified'}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Contact & placement" style={{ height: '100%' }}>
            {isPlaced ? (
              <>
                <Descriptions
                  column={1}
                  size="small"
                  items={[
                    { key: 'aggregator', label: PLACEMENT_FORM.aggregatorLabel, children: reservation.employerName },
                    { key: 'startDate', label: 'Planned joining / start date', children: formatDate(reservation.startDate) },
                  ]}
                />
                <Typography.Paragraph type="secondary" className="small" style={{ margin: '16px 0 0' }}>
                  {PLACEMENT_FINAL_NOTE}
                </Typography.Paragraph>
              </>
            ) : (
              <>
                <Typography.Paragraph type="secondary">
                  Please contact the candidate and fill in the required details.
                </Typography.Paragraph>
                {noAggregators && <Alert type="warning" showIcon title={PLACEMENT_FORM.noAggregators} style={{ marginBottom: 16 }} />}
                <Form<PlacementFormValues>
                  key={reservation.id}
                  layout="vertical"
                  onFinish={values => save.mutate({ startDate: toIsoDate(values.startDate), aggregatorId: values.aggregatorId })}
                >
                  <Form.Item
                    name="startDate"
                    label="Planned joining / start date"
                    extra="Confirm this date with the partner before saving."
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
                    label={PLACEMENT_FORM.aggregatorLabel}
                    extra={PLACEMENT_FORM.aggregatorHint}
                    rules={[{ required: true, message: PLACEMENT_FORM.aggregatorError }]}
                  >
                    <Select
                      placeholder={PLACEMENT_FORM.aggregatorPlaceholder}
                      loading={aggregators.isLoading}
                      disabled={noAggregators}
                      options={aggregators.data?.map(aggregator => ({ value: aggregator.id, label: aggregator.name }))}
                    />
                  </Form.Item>
                  <Flex gap={8} wrap>
                    <Button type="primary" htmlType="submit" loading={save.isPending} disabled={noAggregators}>
                      Save placement ✓
                    </Button>
                    <Popconfirm title="Release this profile back to the pool?" onConfirm={() => release.mutate(undefined)}>
                      <Button loading={release.isPending}>Release lock</Button>
                    </Popconfirm>
                  </Flex>
                </Form>
                {reservation.lockReleaseAt !== undefined && (
                  <Typography.Paragraph type="secondary" className="small" style={{ margin: '24px 0 0' }}>
                    Opening or contacting the partner alone does not stop expiry. Save the placement before the deadline.
                  </Typography.Paragraph>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};
