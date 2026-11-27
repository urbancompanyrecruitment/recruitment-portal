import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Descriptions, Flex, Spin, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { getPartnerStatus } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { useInterviewCities } from '@/api/hooks';
import { DAY_DATE_FORMAT } from '@/domain/constant';
import { PartnerStage, UserRole } from '@/domain/interface';
import { findCity } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/session';
import { PageHeader } from '@/shared/components/ui';
import { RescheduleModal } from '../components/RescheduleModal';
import { FAILED_STAGE_INDEX, PARTNER_RESCHEDULE, PARTNER_STATUS, STAGE_ORDER } from '../constant';

export const StatusPage = () => {
  const user = useSessionUser(UserRole.Partner);
  const status = useQuery({ queryKey: QUERY_KEY.partnerStatus(user.id), queryFn: getPartnerStatus });
  const cities = useInterviewCities();
  const [rescheduling, setRescheduling] = useState(false);

  if (!status.data) return <Spin />;

  const { candidate, slot, stage } = status.data;
  const city = findCity(cities.data ?? [], candidate.interviewCity);
  const failed = stage === PartnerStage.VerificationFailed;
  const stages = PARTNER_STATUS.stages.map((item, index) => (failed && index === FAILED_STAGE_INDEX ? PARTNER_STATUS.failedStage : item));

  return (
    <div className="partner-narrow">
      <PageHeader title={PARTNER_STATUS.title} subtitle={PARTNER_STATUS.subtitle} />
      {failed && <Alert type="error" showIcon title={PARTNER_STATUS.failedNotice} style={{ marginBottom: 18 }} />}
      <Card style={{ marginBottom: 18 }}>
        <Steps
          titlePlacement="vertical"
          current={failed ? FAILED_STAGE_INDEX : STAGE_ORDER.indexOf(stage)}
          status={failed ? 'error' : undefined}
          items={stages}
        />
      </Card>
      <Card>
        <Descriptions
          column={1}
          colon={false}
          size="small"
          items={[
            { key: 'name', label: 'Name', children: candidate.name },
            { key: 'primary', label: 'Primary mobile', children: candidate.primaryPhone },
            {
              key: 'singapore',
              label: 'Singapore mobile',
              children: candidate.singaporePhone ?? <span className="muted">{PARTNER_STATUS.singaporeMissing}</span>,
            },
            ...(candidate.hubName ? [{ key: 'hub', label: PARTNER_STATUS.hubLabel, children: candidate.hubName }] : []),
            ...(slot && city
              ? [
                  { key: 'centre', label: 'Interview centre', children: `${city.centre}, ${city.name}` },
                  { key: 'when', label: 'Day & time', children: `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} (${slot.timeZone})` },
                  { key: 'address', label: 'Address', children: city.address },
                  { key: 'instructions', label: 'Instructions', children: city.instructions },
                ]
              : [{ key: 'no-slot', label: 'Interview', children: PARTNER_STATUS.noSlot }]),
          ]}
        />
        {stage === PartnerStage.Registered && (
          <Flex justify="space-between" align="center" gap={16} wrap className="partner-reschedule">
            <Typography.Text type="secondary" className="small partner-reschedule-note">
              {PARTNER_RESCHEDULE.note}
            </Typography.Text>
            <Button onClick={() => setRescheduling(true)}>{PARTNER_RESCHEDULE.action}</Button>
          </Flex>
        )}
      </Card>
      <RescheduleModal open={rescheduling} country={candidate.country} onClose={() => setRescheduling(false)} />
    </div>
  );
};
