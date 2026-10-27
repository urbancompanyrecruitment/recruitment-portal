import { Dayjs } from 'dayjs';
import { AvailableCandidate } from '@/api/interface';
import { ProviderCategory, ReservationStatus } from '@/domain/interface';

export enum ProfileSort {
  Experience = 'experience',
  Name = 'name',
}

export enum DashboardMetric {
  Available = 'available',
  Awaiting = 'awaiting',
  Assigned = 'assigned',
  JoiningSoon = 'joining-soon',
}

export enum CandidateTab {
  All = 'all',
  Awaiting = 'awaiting',
  Assigned = 'assigned',
}

export interface ProfileFilters {
  search: string;
  country?: string;
  category?: ProviderCategory;
  sort: ProfileSort;
}

export type ProfileComparator = (a: AvailableCandidate, b: AvailableCandidate) => number;

export interface DashboardStat {
  metric: DashboardMetric;
  label: string;
  hint: string;
  to: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
}

export interface CandidateTabConfig {
  key: CandidateTab;
  label: string;
  status?: ReservationStatus;
}

export interface PlacementFormValues {
  startDate: Dayjs;
  aggregatorId: string;
}

export interface HubStatusTagProps {
  hub?: string;
}
