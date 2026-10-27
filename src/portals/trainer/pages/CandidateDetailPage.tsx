import { useQuery } from '@tanstack/react-query';
import { Card, Col, Descriptions, Flex, Row, Skeleton } from 'antd';
import { Navigate, useParams } from 'react-router-dom';
import { getCandidate } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { useSlots, useTrainers } from '@/api/hooks';
import { formatDate } from '@/domain/format';
import { UserRole } from '@/domain/interface';
import { formatSlot } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { Notice, PageHeader, VerificationTag } from '@/shared/components/ui';
import { AssessmentPanel } from '../components/AssessmentPanel';
import { NotesPanel } from '../components/NotesPanel';
import { VerificationPanel } from '../components/VerificationPanel';
import { EMPTY_VALUE, L1_TEST_STATUS, NOT_SCHEDULED, TRAINER_ERROR, TRAINER_PATH, UNASSIGNED } from '../constant';
import { ListRedirectState } from '../interface';

export const CandidateDetailPage = () => {
  const { candidateId = '' } = useParams();
  const user = useSessionUser(UserRole.Trainer);
  const { data: candidate, error } = useQuery({
    queryKey: QUERY_KEY.candidate(candidateId),
    queryFn: () => getCandidate(candidateId),
  });
  const slots = useSlots();
  const trainers = useTrainers();

  if (error) {
    const redirect: ListRedirectState = { error: error.message };
    return <Navigate to={TRAINER_PATH.candidates} replace state={redirect} />;
  }

  if (!candidate) return <Skeleton active />;

  if (candidate.interviewGeography !== user.geography) {
    const redirect: ListRedirectState = { error: TRAINER_ERROR.outsideGeography(user.geography) };
    return <Navigate to={TRAINER_PATH.candidates} replace state={redirect} />;
  }

  const slot = slots.data?.find(item => item.id === candidate.slotId);
  const trainerName = trainers.data?.find(trainer => trainer.id === slot?.trainerId)?.name;

  return (
    <>
      <PageHeader
        back={{ to: TRAINER_PATH.candidates, label: 'Candidates' }}
        title={candidate.name}
        subtitle={`${candidate.phone} · ${candidate.city}, ${candidate.country} · ${candidate.interviewGeography}`}
        extra={<VerificationTag verified={candidate.verified} />}
      />
      <Notice>
        <Flex gap="6px 28px" wrap>
          <span>
            <strong>Interview slot:</strong> {slot ? formatSlot(slot) : NOT_SCHEDULED}
          </span>
          <span>
            <strong>Assigned trainer:</strong> {trainerName ?? UNASSIGNED}
          </span>
          <span>
            <strong>L1 online test:</strong>{' '}
            {candidate.l1Completed ? L1_TEST_STATUS.completed : L1_TEST_STATUS.awaiting}
          </span>
          <span>
            <strong>Invitation:</strong> {candidate.invitationStatus}
          </span>
        </Flex>
      </Notice>
      <Row gutter={[20, 20]} key={candidate.id}>
        <Col xs={24} lg={15}>
          <Flex vertical gap={20}>
            <AssessmentPanel candidate={candidate} trainerName={user.name} />
            <NotesPanel candidate={candidate} trainerName={user.name} />
          </Flex>
        </Col>
        <Col xs={24} lg={9}>
          <Flex vertical gap={20}>
            <VerificationPanel candidate={candidate} trainerName={user.name} />
            <Card title="Registration background">
              <Descriptions
                column={1}
                size="small"
                items={[
                  { key: 'nationality', label: 'Nationality', children: candidate.nationality },
                  { key: 'age', label: 'Age', children: candidate.age },
                  { key: 'source', label: 'Source', children: candidate.source },
                  { key: 'referrer', label: 'Referrer', children: candidate.referrer ?? EMPTY_VALUE },
                  { key: 'cooking', label: 'Cooking', children: candidate.cookingFrequency },
                  { key: 'dogs', label: 'Comfortable around dogs', children: candidate.comfortableWithDogs },
                  { key: 'deep-cleaning', label: 'Deep cleaning', children: candidate.deepCleaningExperience },
                  { key: 'registered', label: 'Registered on', children: formatDate(candidate.createdAt) },
                ]}
              />
            </Card>
          </Flex>
        </Col>
      </Row>
    </>
  );
};
