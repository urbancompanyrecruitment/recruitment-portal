import { Dayjs } from 'dayjs';
import { HubUpdateInput } from '@/api/interface';
import { Aggregator, Candidate, Recruiter, Reservation } from '@/domain/interface';

export interface TrackerRow {
  candidate: Candidate;
  slotLabel: string;
  reservation?: Reservation;
  recruiter?: Recruiter;
  aggregator?: Aggregator;
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

export interface HubFormValues {
  hub: string;
  startDate: Dayjs;
  hubInstructions?: string;
}

export interface HubUpdateVariables {
  candidateId: string;
  input: HubUpdateInput;
}

export interface QuotaUpdateVariables {
  aggregatorId: string;
  quota: number;
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

export interface AggregatorUsage {
  aggregator: Aggregator;
  used: number;
  remaining: number;
  candidateNames: string[];
}
