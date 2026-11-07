import { AdminReservation, Candidate } from '@/domain/interface';

export interface TrackerRow {
  candidate: Candidate;
  slotLabel: string;
  reservation?: AdminReservation;
}

export interface OverviewMetric {
  label: string;
  hint?: string;
  to?: string;
  matches: (row: TrackerRow) => boolean;
}

export interface EventTagStyle {
  label: string;
  color?: string;
}

export interface SingaporePhoneFormValues {
  singaporePhone: string;
}

export interface SingaporePhoneVariables {
  candidateId: string;
  singaporePhone: string;
}

export interface ImportVariables {
  primaryPhones: string[];
  fileName: string;
}

export interface TemporaryPasswordNotice {
  title: string;
  password: string;
}
