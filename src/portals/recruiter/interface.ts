import { Dayjs } from 'dayjs';
import { AvailableCandidate } from '@/api/interface';
import { ReservationStatus } from '@/domain/interface';

export enum ProfileSort {
  Verified = 'verified',
  Name = 'name',
}

export enum DashboardMetric {
  Available = 'available',
  Awaiting = 'awaiting',
  Placed = 'placed',
}

export enum CandidateTab {
  All = 'all',
  Awaiting = 'awaiting',
  Placed = 'placed',
}

export interface ProfileFilters {
  search: string;
  country?: string;
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
  employerName: string;
}

export interface DemoAccount {
  label: string;
  email: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
