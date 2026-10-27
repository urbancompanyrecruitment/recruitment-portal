import { CheckCircleFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Descriptions, Flex, Result, Row, Skeleton, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';
import { getRegistration, markL1Completed } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { ASSESSMENT_STAGES, DAY_DATE_FORMAT, STAGE_DESCRIPTION, STAGE_LABEL } from '@/domain/constant';
import { AssessmentStage } from '@/domain/interface';
import { Notice, PageHeader, ResultTag } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { COLOR } from '@/theme/constant';
import { INVITATION_LABEL, L1_COMPLETED_MESSAGE, L2_ELIGIBILITY, PARTNER_ROUTE, STEP_STATUS } from '../constant';

export const ConfirmationPage = () => {
  const { candidateId = '' } = useParams();
  const registration = useQuery({
    queryKey: QUERY_KEY.registration(candidateId),
    queryFn: () => getRegistration(candidateId),
  });
  const completeL1 = useAppMutation(markL1Completed, L1_COMPLETED_MESSAGE);

  if (registration.isLoading) return <Skeleton active />;
  if (!registration.data) {
    return (
      <Result
        status="404"
        title="Registration not found"
        subTitle="This registration link is not valid in this browser."
        extra={
          <Link to={PARTNER_ROUTE.registration}>
            <Button type="primary">Register</Button>
          </Link>
        }
      />
    );
  }

  const { candidate, slot } = registration.data;
  const l1Result = candidate.results[AssessmentStage.L1];

  return (
    <>
      <PageHeader
        title={
          <Flex align="center" gap={12}>
            <CheckCircleFilled style={{ color: COLOR.green }} />
            Your registration is complete
          </Flex>
        }
        subtitle="Your online English test and selected interview details are shown together."
      />
      <Notice tone="success">
        <strong>{candidate.name}</strong> · {candidate.phone}
        <br />
        Your L1 English interview link is sent to this WhatsApp number by Hireflix. Status:{' '}
        <strong>{INVITATION_LABEL[candidate.invitationStatus]}</strong>.{' '}
        <span className="small">Demo — no message is actually sent.</span>
      </Notice>
      <Row gutter={[23, 23]}>
        <Col xs={24} lg={12}>
          <Card style={{ height: '100%' }}>
            <span className="eyebrow">Level 1 English interview</span>
            <Typography.Title level={3} style={{ margin: '8px 0' }}>
              Complete your online test
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Complete L1 at home or at the training centre. You will proceed to Level 2 only if you pass L1.
            </Typography.Paragraph>
            <Flex align="center" gap={12} wrap style={{ margin: '20px 0' }}>
              <ResultTag result={l1Result} label="L1" />
              <Button
                type="primary"
                disabled={candidate.l1Completed}
                loading={completeL1.isPending}
                onClick={() => completeL1.mutate(candidate.id)}
              >
                {candidate.l1Completed ? 'L1 marked completed' : 'Simulate L1 completion'}
              </Button>
            </Flex>
            <Typography.Paragraph type="secondary" className="small" style={{ marginBottom: 0 }}>
              This records completion only — trainers decide pass or fail. The real Hireflix link will be wired in
              with the backend.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ height: '100%' }}>
            <span className="eyebrow">Your selected interview slot</span>
            <Typography.Title level={3} style={{ margin: '8px 0 16px' }}>
              {candidate.interviewGeography}
            </Typography.Title>
            {slot ? (
              <Descriptions
                column={1}
                size="small"
                items={[
                  { key: 'centre', label: 'Centre', children: slot.centre },
                  { key: 'date', label: 'Day & date', children: dayjs(slot.date).format(DAY_DATE_FORMAT) },
                  { key: 'time', label: 'Time', children: `${slot.time} (${slot.timeZone})` },
                  { key: 'address', label: 'Address', children: slot.address },
                  { key: 'instructions', label: 'Instructions', children: slot.instructions },
                ]}
              />
            ) : (
              <Typography.Paragraph type="secondary">
                No slot selected yet. New dates will be shared on WhatsApp.
              </Typography.Paragraph>
            )}
            <Notice style={{ marginTop: 20, marginBottom: 0 }}>
              L2 eligibility: <strong>{L2_ELIGIBILITY[l1Result]}</strong>
              <br />
              Your selected slot stays booked regardless of your L1 result.
            </Notice>
          </Card>
        </Col>
      </Row>
      <Card title="Assessment progress" style={{ marginTop: 23 }}>
        <Steps
          items={[
            ...ASSESSMENT_STAGES.map(stage => ({
              title: `${STAGE_LABEL[stage]} · ${STAGE_DESCRIPTION[stage]}`,
              content: candidate.results[stage],
              status: STEP_STATUS[candidate.results[stage]],
            })),
            {
              title: 'UC Verified',
              content: candidate.verified ? 'Verified' : 'Not yet',
              status: candidate.verified ? 'finish' : 'wait',
            },
          ]}
        />
      </Card>
      <Typography.Paragraph type="secondary" className="small" style={{ marginTop: 24 }}>
        <Link to={PARTNER_ROUTE.registration}>Register another partner</Link>
      </Typography.Paragraph>
    </>
  );
};
