import { InterviewCity } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { BookableSlot, SlotDaySummary } from './interface';

export const listInterviewCities = (): Promise<InterviewCity[]> => request<InterviewCity[]>(API_PATH.interviewCities);

export const listBookableSlotsFor = (cityKey: string): Promise<BookableSlot[]> =>
  request<BookableSlot[]>(API_PATH.interviewSlots(cityKey));

export const listUpcomingSlotDays = (): Promise<SlotDaySummary[]> => request<SlotDaySummary[]>(API_PATH.slotOccupancy);
