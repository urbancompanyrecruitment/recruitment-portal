export enum ProviderCategory {
  RegularCleaning = 'Regular cleaning',
  PremiumCleaning = 'Premium cleaning',
  Ironing = 'Ironing',
  NotAssigned = 'Not assigned',
}

export enum RecruitmentSource {
  TikTok = 'TikTok',
  Facebook = 'Facebook / Meta',
  Referral = 'Professional referral',
  Recruiter = 'Recruiter',
  Aggregator = 'Aggregator',
  Influencer = 'Influencer',
  Direct = 'Direct',
  Other = 'Other',
}

export enum CookingFrequency {
  Never = 'Never',
  Occasionally = 'Occasionally',
  Frequently = 'Frequently',
  VeryFrequently = 'Very frequently',
  Daily = 'Daily',
}

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export enum UserRole {
  Partner = 'partner',
  Recruiter = 'recruiter',
  Business = 'business',
}

export enum PartnerStage {
  Registered = 'registered',
  Verified = 'verified',
  Placed = 'placed',
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

export enum ReservationEventType {
  Opened = 'opened',
  PlacementSaved = 'placement-saved',
  Expired = 'expired',
  HubUpdated = 'hub-updated',
}

export enum ReservationStatus {
  AwaitingAggregator = 'awaiting-aggregator',
  AggregatorAssigned = 'aggregator-assigned',
}

export enum ImportRowOutcome {
  Accepted = 'accepted',
  InvalidPhone = 'invalid_phone',
  DuplicateInFile = 'duplicate_in_file',
  NotFound = 'not_found',
  AlreadyVerified = 'already_verified',
  NoSingaporeNumber = 'no_singapore_number',
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
  leadCreatedAt: string;
  approvedAt?: string;
}

export interface Candidate {
  id: string;
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
  interviewCity: string;
  slotId?: string;
  category: ProviderCategory;
  yearsOfExperience: number;
  bio: string;
  onboarding?: Onboarding;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface PartnerAccount {
  candidateId: string;
  password: string;
}

export interface Recruiter {
  id: string;
  name: string;
  company: string;
  loginId: string;
  active: boolean;
}

export interface Aggregator {
  id: string;
  name: string;
  quota: number;
}

export interface Reservation {
  candidateId: string;
  recruiterId: string;
  lockedAt: number;
  lockReleaseAt: number;
  state: LockState;
  inactiveReason?: InactiveReason;
  inactiveAt?: number;
  startDate?: string;
  aggregatorId?: string;
  hub?: string;
  hubInstructions?: string;
}

export interface ReservationEvent {
  id: string;
  type: ReservationEventType;
  candidateId: string;
  recruiterId?: string;
  at: number;
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
