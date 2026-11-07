import {
  Candidate,
  CookingFrequency,
  ImportRowOutcome,
  InterviewSlot,
  PartnerStage,
  PartnerState,
  Recruiter,
  RecruitmentSource,
  Reservation,
} from '@/domain/interface';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export interface ErrorBody {
  error?: { code?: string; message?: string };
}

export interface RegistrationInput {
  name: string;
  primaryPhone: string;
  password: string;
  singaporePhone?: string;
  country: string;
  city: string;
  nationality: string;
  age: number;
  source: RecruitmentSource;
  referrer?: string;
  comfortableWithDogs: boolean;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: boolean;
  consent: boolean;
  interviewCity: string;
  slotId: string;
}

export interface RegistrationResult {
  candidate: Candidate;
  slot?: InterviewSlot;
}

export interface PartnerStatus {
  candidate: Candidate;
  slot?: InterviewSlot;
  stage: PartnerStage;
}

export interface BookableSlot extends InterviewSlot {
  seatsLeft: number;
}

export interface SlotDaySummary {
  date: string;
  cityKey: string;
  slots: number;
  booked: number;
  capacity: number;
}

export interface CandidateFilters {
  state?: PartnerState;
  cityKey?: string;
  source?: RecruitmentSource;
}

export interface ImportRow {
  rowNumber: number;
  primaryPhone: string;
  outcome: ImportRowOutcome;
  candidateId?: string;
}

export interface VerifiedImportResult {
  importId: string;
  fileName: string;
  counts: { rows: number; accepted: number; failed: number };
  rows: ImportRow[];
}

export type AvailableCandidate = Candidate;

export interface ReservedCandidate {
  candidate: Candidate;
  reservation: Reservation;
}

export interface PlacementInput {
  startDate: string;
  employerName: string;
}

export interface RecruiterInput {
  name: string;
  company: string;
  email: string;
}

export interface CreatedRecruiter {
  recruiter: Recruiter;
  temporaryPassword: string;
}

export interface TemporaryPasswordResult {
  temporaryPassword: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
}

export interface BackendPartner extends Omit<Candidate, 'id'> {
  id: string;
}

export interface BackendSignUpResult {
  partner: Candidate;
  slot: InterviewSlot;
}

export interface BackendPartnerStatus {
  partner: Candidate;
  slot?: InterviewSlot;
}

export interface BackendLock {
  id: string;
  partnerId: string;
  recruiterId: string;
  lockedAt: string;
  lockReleaseAt: string;
  state: Reservation['state'];
  inactiveReason?: Reservation['inactiveReason'];
  inactiveAt?: string;
  employerName?: string;
  startDate?: string;
  placementRecordedAt?: string;
}

export interface BackendAdminLock extends BackendLock {
  partnerName: string;
  recruiterName: string;
  recruiterCompany: string;
}

export interface BackendLockedPartner {
  lock: BackendLock;
  partner: Candidate;
}

export interface BackendImportRow {
  rowNumber: number;
  primaryPhone: string;
  outcome: ImportRowOutcome;
  partnerId?: string;
}

export interface BackendImportResult {
  importId: string;
  fileName: string;
  counts: { rows: number; accepted: number; failed: number };
  rows: BackendImportRow[];
}
