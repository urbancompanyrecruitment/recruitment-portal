import { AssessmentStage, Candidate, InterviewSlot, StageResult } from '@/domain/interface';

export enum CandidateStatusTab {
  All = 'all',
  InProgress = 'in-progress',
  Failed = 'failed',
  Verified = 'verified',
}

export enum CandidateMilestone {
  ReadyToVerify = 'ready-to-verify',
  Verified = 'verified',
}

export enum ScheduleRange {
  Upcoming = 'upcoming',
  Past = 'past',
}

export type CandidateProgress = AssessmentStage | CandidateMilestone;

export interface CandidateStatusTabConfig {
  value: CandidateStatusTab;
  label: string;
  matches: (candidate: Candidate) => boolean;
}

export interface CandidateFilters {
  interviewDate?: string;
  trainerId?: string;
  progress?: CandidateProgress;
  result?: StageResult;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CandidateFilterField {
  key: keyof CandidateFilters;
  placeholder: string;
  options: FilterOption[];
}

export interface CandidateRow {
  candidate: Candidate;
  slot?: InterviewSlot;
  trainerName?: string;
  progress: CandidateProgress;
  currentResult: StageResult;
}

export interface ListRedirectState {
  error?: string;
}

export interface CandidatePanelProps {
  candidate: Candidate;
  trainerName: string;
}

export interface StageResultInput {
  stage: AssessmentStage;
  result: StageResult;
}

export interface NoteFormValues {
  text: string;
}
