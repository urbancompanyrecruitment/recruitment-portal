import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Spin, Steps } from 'antd';
import dayjs from 'dayjs';
import { getPartnerStatus } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { useInterviewCities } from '@/api/hooks';
import { DAY_DATE_FORMAT } from '@/domain/constant';
import { PartnerStage, UserRole } from '@/domain/interface';
import { findCity } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { Notice, PageHeader } from '@/shared/components/ui';
import { PARTNER_STATUS } from '../constant';

const STAGE_ORDER = [PartnerStage.Registered, PartnerStage.Verified, PartnerStage.Placed, PartnerStage.Joined];

export const StatusPage = () => {
  const user = useSessionUser(UserRole.Partner);
  const status = useQuery({ queryKey: QUERY_KEY.partnerStatus(user.id), queryFn: getPartnerStatus });
  const cities = useInterviewCities();

  if (!status.data) return <Spin />;

  const { candidate, slot, stage } = status.data;
  const city = findCity(cities.data ?? [], candidate.interviewCity);

  return (
    <div className="partner-narrow">
      <PageHeader title={PARTNER_STATUS.title} subtitle={PARTNER_STATUS.subtitle} />
      <Card style={{ marginBottom: 18 }}>
        <Steps current={STAGE_ORDER.indexOf(stage)} items={PARTNER_STATUS.stages} />
      </Card>
      <Card>
        <Descriptions
          column={1}
          size="small"
          items={[
            { key: 'name', label: 'Name', children: candidate.name },
            { key: 'primary', label: 'Primary mobile', children: candidate.primaryPhone },
            {
              key: 'singapore',
              label: 'Singapore mobile',
              children: candidate.singaporePhone ?? <span className="muted">{PARTNER_STATUS.singaporeMissing}</span>,
            },
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
        {candidate.onboarding && (
          <Notice tone="success" style={{ marginTop: 20, marginBottom: 0 }}>
            {PARTNER_STATUS.onboardingNote}
          </Notice>
        )}
      </Card>
    </div>
  );
};
