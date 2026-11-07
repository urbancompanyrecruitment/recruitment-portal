export enum RecruitmentSource {
  TikTok = 'tiktok',
  Facebook = 'facebook',
  Referral = 'referral',
  Recruiter = 'recruiter',
  Aggregator = 'aggregator',
  Influencer = 'influencer',
  Direct = 'direct',
  Other = 'other',
}

export enum CookingFrequency {
  Never = 'never',
  Occasionally = 'occasionally',
  Frequently = 'frequently',
  VeryFrequently = 'very_frequently',
  Daily = 'daily',
}

export enum UserRole {
  Partner = 'partner',
  Recruiter = 'recruiter',
  Business = 'business',
}

export enum PartnerState {
  SignedUp = 'signed_up',
  Verified = 'verified',
  Placed = 'placed',
  Joined = 'joined',
}

export enum PartnerStage {
  Registered = 'registered',
  Verified = 'verified',
  Placed = 'placed',
  Joined = 'joined',
}

export enum LockState {
  Active = 'active',
  Inactive = 'inactive',
}

export enum InactiveReason {
  Expired = 'expired',
  Placed = 'placed',
  Released = 'released',
}

export enum ReservationStatus {
  AwaitingPlacement = 'awaiting-placement',
  Placed = 'placed',
}

export enum RecruiterStatus {
  Active = 'active',
  Suspended = 'suspended',
}

export enum ImportRowOutcome {
  Accepted = 'accepted',
  InvalidPhone = 'invalid_phone',
  DuplicateInFile = 'duplicate_in_file',
  NotFound = 'not_found',
  AlreadyVerified = 'already_verified',
  NoSingaporeNumber = 'no_singapore_number',
  ApprovalFailed = 'approval_failed',
}

export interface InterviewCity {
  key: string;
  name: string;
  centre: string;
  address: string;
  instructions: string;
}

export interface InterviewSlot {
  id: string;
  cityKey: string;
  date: string;
  time: string;
  timeZone: string;
  capacity: number;
}

export interface Onboarding {
  leadId: string;
  journeyId?: string;
  leadCreatedAt: string;
  approvedAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  primaryPhone?: string;
  singaporePhone?: string;
  hasSingaporePhone: boolean;
  country: string;
  city: string;
  nationality: string;
  age: number;
  source: RecruitmentSource;
  referrer?: string;
  comfortableWithDogs: boolean;
  deepCleaningExperience: boolean;
  cookingFrequency: CookingFrequency;
  interviewCity: string;
  slotId?: string;
  state: PartnerState;
  stage: PartnerStage;
  verified: boolean;
  verifiedAt?: string;
  onboarding?: Onboarding;
  createdAt: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  status: RecruiterStatus;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  candidateId: string;
  recruiterId: string;
  lockedAt: number;
  lockReleaseAt: number;
  state: LockState;
  inactiveReason?: InactiveReason;
  inactiveAt?: number;
  employerName?: string;
  startDate?: string;
  placementRecordedAt?: number;
}

export interface AdminReservation extends Reservation {
  candidateName: string;
  recruiterName: string;
  recruiterCompany: string;
}

export interface ChannelFunnelRow {
  source: RecruitmentSource;
  signups: number;
  withSingaporePhone: number;
  verified: number;
  placed: number;
  conversion: number;
}

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  subtitle: string;
  accesses: string[];
}

export interface LabelledOption<T> {
  value: T;
  label: string;
}
