import { Button, Card, Descriptions, Flex, Result } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCandidate } from '@/api/candidates';
import { useInterviewCities } from '@/api/hooks';
import { RegistrationResult } from '@/api/interface';
import { DAY_DATE_FORMAT } from '@/domain/constant';
import { findCity } from '@/domain/slot';
import { PageHeader } from '@/shared/components/ui';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { RegistrationMode } from '@/shared/registration/interface';
import { PartnerDetailsForm } from '@/shared/registration/PartnerDetailsForm';
import { PARTNER_ROUTE, REGISTRATION, THANK_YOU } from '../constant';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<RegistrationResult>();
  const cities = useInterviewCities();
  const register = useAppMutation(registerCandidate, REGISTRATION.successMessage);

  if (!registration) {
    return (
      <>
        <PageHeader title={REGISTRATION.title} subtitle={REGISTRATION.subtitle} />
        <PartnerDetailsForm
          mode={RegistrationMode.Partner}
          submitting={register.isPending}
          onSubmit={({ source, ...details }) => {
            if (!source) return;

            register.mutate({ ...details, source }, { onSuccess: setRegistration });
          }}
        />
      </>
    );
  }

  const { candidate, slot } = registration;
  const city = findCity(cities.data ?? [], candidate.interviewCity);

  return (
    <Card>
      <Result
        status="success"
        title={THANK_YOU.title}
        subTitle={THANK_YOU.subtitle}
        extra={
          <Flex gap={10} justify="center" wrap>
            <Button type="primary" onClick={() => navigate(PARTNER_ROUTE.login)}>
              {THANK_YOU.checkStatus}
            </Button>
            <Button onClick={() => setRegistration(undefined)}>{THANK_YOU.registerAnother}</Button>
          </Flex>
        }
      >
        <Descriptions
          column={1}
          colon={false}
          size="small"
          items={[
            { key: 'name', label: 'Name', children: candidate.name },
            { key: 'primary', label: 'Primary mobile', children: candidate.primaryPhone },
            ...(candidate.singaporePhone ? [{ key: 'singapore', label: 'Singapore mobile', children: candidate.singaporePhone }] : []),
            ...(slot && city
              ? [
                  { key: 'centre', label: 'Interview centre', children: `${city.centre}, ${city.name}` },
                  { key: 'when', label: 'Day & time', children: `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} (${slot.timeZone})` },
                  { key: 'address', label: 'Address', children: city.address },
                  { key: 'instructions', label: 'Instructions', children: city.instructions },
                ]
              : [{ key: 'no-slot', label: 'Interview', children: THANK_YOU.noSlot }]),
          ]}
        />
      </Result>
    </Card>
  );
};
