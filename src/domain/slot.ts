import dayjs from 'dayjs';
import { DAY_DATE_FORMAT } from './constant';
import { Candidate, Geography, InterviewSlot } from './interface';

export const countSlotBookings = (candidates: Candidate[], slotId: string): number =>
  candidates.filter(candidate => candidate.slotId === slotId).length;

export const compareSlots = (a: InterviewSlot, b: InterviewSlot): number =>
  `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);

export const listBookableSlots = (
  slots: InterviewSlot[],
  candidates: Candidate[],
  geography: Geography,
  today: string,
): InterviewSlot[] =>
  slots
    .filter(slot => slot.isOpen && slot.geography === geography && slot.date >= today)
    .filter(slot => countSlotBookings(candidates, slot.id) < slot.capacity)
    .sort(compareSlots);

export const formatSlot = (slot: InterviewSlot): string =>
  `${dayjs(slot.date).format(DAY_DATE_FORMAT)} · ${slot.time} · ${slot.timeZone}`;
