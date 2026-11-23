import { InterviewCentre, InterviewCity } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { BookableSlot, SlotDaySummary, SlotImportResult, SlotUploadRow } from './interface';

export const listInterviewCities = (country?: string): Promise<InterviewCity[]> =>
  request<InterviewCity[]>(API_PATH.interviewCities(country));

export const listBookableSlotsFor = (cityKey: string): Promise<BookableSlot[]> =>
  request<BookableSlot[]>(API_PATH.interviewSlots(cityKey));

export const listUpcomingSlotDays = (): Promise<SlotDaySummary[]> => request<SlotDaySummary[]>(API_PATH.slotOccupancy);

export const listInterviewCentres = (): Promise<InterviewCentre[]> => request<InterviewCentre[]>(API_PATH.interviewCentres);

export const importSlots = (rows: SlotUploadRow[], fileName: string): Promise<SlotImportResult> =>
  request<SlotImportResult>(API_PATH.slotImports, { method: 'POST', body: { fileName, rows } });
