import {
  Candidate,
  CookingFrequency,
  Geography,
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
  phone: string;
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

export interface BookableSlot extends InterviewSlot {
  seatsLeft: number;
}

export interface RegistrationDetails {
  candidate: Candidate;
  slot?: InterviewSlot;
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
