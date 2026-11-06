import dayjs, { Dayjs } from 'dayjs';
import {
  DAY_DATE_FORMAT,
  INTERVIEW_TIME_ZONE,
  ISO_DATE_FORMAT,
  SINGAPORE_INTERVIEW_CITIES,
  SLOT_CAPACITY,
  SLOT_END_HOUR,
  SLOT_ID_SEPARATOR,
  SLOT_START_HOUR,
  SLOT_TIME_FORMAT,
  SLOT_WINDOW_DAYS,
} from './constant';
import { Candidate, InterviewCity, InterviewSlot } from './interface';

export const getInterviewCity = (cityKey: string): InterviewCity | undefined =>
  SINGAPORE_INTERVIEW_CITIES.find(city => city.key === cityKey);

export const countSlotBookings = (candidates: Candidate[], slotId: string): number =>
  candidates.filter(candidate => candidate.slotId === slotId).length;

export const generateSlots = (now: Dayjs): InterviewSlot[] =>
  SINGAPORE_INTERVIEW_CITIES.flatMap(city =>
    Array.from({ length: SLOT_WINDOW_DAYS + 1 }, (_, dayOffset) => now.add(dayOffset, 'day'))
      .flatMap(day =>
        Array.from({ length: SLOT_END_HOUR - SLOT_START_HOUR }, (_, index) =>
          day.hour(SLOT_START_HOUR + index).minute(0).second(0).millisecond(0),
        ),
      )
      .filter(start => start.isAfter(now))
      .map(start => {
        const date = start.format(ISO_DATE_FORMAT);
        const time = start.format(SLOT_TIME_FORMAT);

        return {
          id: [city.key, date, time].join(SLOT_ID_SEPARATOR),
          cityKey: city.key,
          date,
          time,
          timeZone: INTERVIEW_TIME_ZONE,
          capacity: SLOT_CAPACITY,
        };
      }),
  );

export const parseSlotId = (slotId: string): InterviewSlot | undefined => {
  const [cityKey, date, time] = slotId.split(SLOT_ID_SEPARATOR);

  if (!cityKey || !date || !time) return undefined;

  return { id: slotId, cityKey, date, time, timeZone: INTERVIEW_TIME_ZONE, capacity: SLOT_CAPACITY };
};

export const listBookableSlots = (cityKey: string, candidates: Candidate[], now: Dayjs): InterviewSlot[] =>
  generateSlots(now)
    .filter(slot => slot.cityKey === cityKey)
    .filter(slot => countSlotBookings(candidates, slot.id) < slot.capacity);

export const formatSlot = (slot: InterviewSlot): string =>
  `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} · ${slot.timeZone}`;
