import { Button, Card, Descriptions, Flex, Result } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCandidateAsRecruiter } from '@/api/candidates';
import { RegistrationResult } from '@/api/interface';
import { formatSlot } from '@/domain/slot';
import { Notice, PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { RegistrationMode } from '@/shared/registration/interface';
import { PartnerDetailsForm } from '@/shared/registration/PartnerDetailsForm';
import { RECRUITER_PATH, REGISTER_PARTNER } from '../constant';

export const RegisterPartnerPage = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<RegistrationResult>();
  const register = useAppMutation(registerCandidateAsRecruiter, REGISTER_PARTNER.successMessage);

  if (!registration) {
    return (
      <>
        <PageHeader title={REGISTER_PARTNER.title} subtitle={REGISTER_PARTNER.subtitle} />
        <Notice>{REGISTER_PARTNER.note}</Notice>
        <PartnerDetailsForm
          mode={RegistrationMode.Recruiter}
          submitting={register.isPending}
          onSubmit={({ source, referrer, ...details }) => register.mutate(details, { onSuccess: setRegistration })}
        />
      </>
    );
  }

  const { candidate, slot } = registration;

  return (
    <Card>
      <Result
        status="success"
        title={REGISTER_PARTNER.successTitle(candidate.name)}
        subTitle={REGISTER_PARTNER.successSubtitle}
        extra={
          <Flex gap={10} justify="center" wrap>
            <Button type="primary" onClick={() => setRegistration(undefined)}>
              {REGISTER_PARTNER.registerAnother}
            </Button>
            <Button onClick={() => navigate(RECRUITER_PATH.myCandidates)}>{REGISTER_PARTNER.viewCandidates}</Button>
          </Flex>
        }
      >
        <Descriptions
          column={1}
          size="small"
          items={[
            { key: 'name', label: 'Name', children: candidate.name },
            { key: 'primary', label: 'Primary mobile', children: candidate.primaryPhone },
            ...(candidate.singaporePhone ? [{ key: 'singapore', label: 'Singapore mobile', children: candidate.singaporePhone }] : []),
            ...(slot ? [{ key: 'slot', label: 'Interview slot', children: formatSlot(slot) }] : []),
          ]}
        />
      </Result>
    </Card>
  );
};
