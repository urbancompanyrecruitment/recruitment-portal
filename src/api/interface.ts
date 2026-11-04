import {
  Candidate,
  CookingFrequency,
  Geography,
  ImportRowOutcome,
  InterviewSlot,
  RecruitmentSource,
  Reservation,
  YesNo,
} from '@/domain/interface';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export interface ApiEnvelope<T> {
  isError?: boolean;
  success?: { data: T };
  error?: { message?: string };
  message?: string;
}

export interface GoogleIdTokenPayload {
  email: string;
}

export interface GoogleLoginResponse {
  token: string;
}

export interface DashboardUser {
  _id: string;
  name: string;
  email: string;
  role: string[];
  team: string[];
  is_active?: boolean;
}

export interface RegistrationInput {
  name: string;
  primaryPhone: string;
  singaporePhone?: string;
  country: string;
  city: string;
  nationality: string;
  age: number;
  source: RecruitmentSource;
  referrer?: string;
  comfortableWithDogs: YesNo;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: YesNo;
  consent: boolean;
  interviewGeography: Geography;
  slotId?: string;
}

export interface RegistrationResult {
  candidate: Candidate;
  slot?: InterviewSlot;
}

export interface BookableSlot extends InterviewSlot {
  seatsLeft: number;
}

export interface ImportRow {
  rowNumber: number;
  primaryPhone: string;
  outcome: ImportRowOutcome;
  candidateId?: string;
}

export interface VerifiedImportResult {
  fileName: string;
  counts: { rows: number; accepted: number; failed: number };
  rows: ImportRow[];
}

export type AvailableCandidate = Pick<
  Candidate,
  'id' | 'name' | 'country' | 'city' | 'nationality' | 'category' | 'yearsOfExperience' | 'bio' | 'verified'
>;

export interface ReservedCandidate {
  candidate: Candidate;
  reservation: Reservation;
}

export interface PlacementInput {
  startDate: string;
  aggregatorId: string;
}

export interface HubUpdateInput {
  hub: string;
  startDate: string;
  hubInstructions: string;
}

export interface SlotInput {
  trainerId: string;
  date: string;
  time: string;
  capacity: number;
  centre: string;
  address: string;
  instructions: string;
}

export interface TrainerInput {
  name: string;
  loginId: string;
  geography: Geography;
}

export interface RecruiterInput {
  name: string;
  company: string;
  loginId: string;
}
