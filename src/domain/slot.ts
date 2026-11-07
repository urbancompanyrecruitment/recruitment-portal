import dayjs from 'dayjs';
import { DAY_DATE_FORMAT, INTERVIEW_TIME_ZONE, SLOT_ID_SEPARATOR } from './constant';
import { InterviewCity, InterviewSlot } from './interface';

export const findCity = (cities: InterviewCity[], cityKey: string | undefined): InterviewCity | undefined =>
  cities.find(city => city.key === cityKey);

export const parseSlotId = (slotId: string): InterviewSlot | undefined => {
  const [cityKey, date, time] = slotId.split(SLOT_ID_SEPARATOR);

  if (!cityKey || !date || !time) return undefined;

  return { id: slotId, cityKey, date, time, timeZone: INTERVIEW_TIME_ZONE, capacity: 0 };
};

export const formatSlot = (slot: InterviewSlot): string =>
  `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} · ${slot.timeZone}`;
