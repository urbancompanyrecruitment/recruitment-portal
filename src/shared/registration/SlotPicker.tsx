import { EnvironmentOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Flex, Form, Radio, Select, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { QUERY_KEY } from '@/api/constant';
import { useInterviewCities } from '@/api/hooks';
import { listBookableSlotsFor } from '@/api/slots';
import { DAY_DATE_FORMAT } from '@/domain/constant';
import { PartnerCountry } from '@/domain/interface';
import { findCity } from '@/domain/slot';
import {
  CHOOSE_CITY_MESSAGE,
  INTERVIEW_CITY_ERROR,
  INTERVIEW_CITY_HINT,
  INTERVIEW_SLOT_ERROR,
  NO_SLOTS_MESSAGE,
  SLOT_DAY_FORMAT,
} from './constant';
import { SlotPickerProps } from './interface';

export const SlotPicker = ({ country }: SlotPickerProps) => {
  const form = Form.useFormInstance();
  const interviewCity = Form.useWatch('interviewCity', form);
  const slotId = Form.useWatch('slotId', form);
  const cities = useInterviewCities(country);
  const slots = useQuery({
    queryKey: QUERY_KEY.bookableSlots(interviewCity ?? ''),
    queryFn: () => listBookableSlotsFor(interviewCity),
    enabled: Boolean(interviewCity),
  });
  const selectedSlot = slots.data?.find(slot => slot.id === slotId);
  const selectedCity = findCity(cities.data ?? [], interviewCity);
  const slotDays = [...new Set(slots.data?.map(slot => slot.date) ?? [])];
  const onlyCityKey = cities.data?.length === 1 ? cities.data[0].key : undefined;
  const listHint = country === PartnerCountry.Others ? INTERVIEW_CITY_HINT.others : INTERVIEW_CITY_HINT.country;
  const cityHint = onlyCityKey ? INTERVIEW_CITY_HINT.single : listHint;

  useEffect(() => {
    if (!onlyCityKey || interviewCity === onlyCityKey) return;

    form.setFieldsValue({ interviewCity: onlyCityKey, slotId: undefined });
  }, [onlyCityKey, interviewCity, form]);

  return (
    <>
      <Form.Item
        name="interviewCity"
        label="Interview city"
        extra={country ? cityHint : INTERVIEW_CITY_HINT.noCountry}
        rules={[{ required: true, message: INTERVIEW_CITY_ERROR }]}
      >
        <Select
          placeholder="Select"
          disabled={!country}
          loading={cities.isLoading}
          options={cities.data?.map(city => ({ value: city.key, label: [...new Set([city.name, city.country])].join(', ') }))}
          onChange={() => form.setFieldValue('slotId', undefined)}
        />
      </Form.Item>
      {country && !interviewCity && <Typography.Paragraph type="secondary">{CHOOSE_CITY_MESSAGE}</Typography.Paragraph>}
      {slots.isFetching && <Spin />}
      {slots.data?.length === 0 && <Alert type="info" showIcon title={NO_SLOTS_MESSAGE} style={{ marginBottom: 20 }} />}
      {Boolean(slots.data?.length) && (
        <Form.Item name="slotId" label="Interview slot" rules={[{ required: true, message: INTERVIEW_SLOT_ERROR }]}>
          <Radio.Group className="slot-options">
            {slotDays.map(date => (
              <div key={date} className="slot-day">
                <div className="small muted slot-day-label">{dayjs(date).format(SLOT_DAY_FORMAT)}</div>
                <Flex gap={6} wrap>
                  {slots.data
                    ?.filter(slot => slot.date === date)
                    .map(slot => (
                      <Radio.Button key={slot.id} value={slot.id}>
                        {slot.time}
                      </Radio.Button>
                    ))}
                </Flex>
              </div>
            ))}
          </Radio.Group>
        </Form.Item>
      )}
      {selectedSlot && selectedCity && (
        <div className="centre-box">
          <span className="eyebrow">Interview centre</span>
          <Typography.Title level={4} style={{ margin: '6px 0' }}>
            {selectedCity.centre}
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 4 }}>
            <EnvironmentOutlined /> {selectedCity.address}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            {dayjs(selectedSlot.date).format(DAY_DATE_FORMAT)} · {selectedSlot.time} ({selectedSlot.timeZone}) · {selectedSlot.seatsLeft}{' '}
            {selectedSlot.seatsLeft === 1 ? 'seat' : 'seats'} left
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" className="small" style={{ marginBottom: 0 }}>
            {selectedCity.instructions}
          </Typography.Paragraph>
        </div>
      )}
    </>
  );
};
