export enum Geography {
  Singapore = 'Singapore',
  Myanmar = 'Myanmar',
  Overseas = 'Overseas',
}

export enum StageResult {
  Pending = 'Pending',
  Passed = 'Passed',
  Failed = 'Failed',
}

export enum AssessmentStage {
  L1 = 'l1',
  L2 = 'l2',
  L3 = 'l3',
}

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

export enum InvitationStatus {
  Queued = 'Queued',
  Sent = 'Sent',
  Completed = 'Completed',
}

export enum UserRole {
  Trainer = 'trainer',
  Recruiter = 'recruiter',
  Business = 'business',
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

export type StageResults = Record<AssessmentStage, StageResult>;

export interface AuditStamp {
  id: string;
  by: string;
  at: string;
}

export interface CandidateNote extends AuditStamp {
  text: string;
}

export interface StageAttempt {
  stage: AssessmentStage;
  previous: StageResult;
  result: StageResult;
  trainer: string;
  at: string;
}

export interface Candidate {
  id: string;
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
  category: ProviderCategory;
  yearsOfExperience: number;
  bio: string;
  results: StageResults;
  attempts: StageAttempt[];
  notes: CandidateNote[];
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  invitationStatus: InvitationStatus;
  l1Completed: boolean;
  createdAt: string;
}

export interface InterviewSlot {
  id: string;
  geography: Geography;
  date: string;
  time: string;
  timeZone: string;
  trainerId: string;
  capacity: number;
  centre: string;
  address: string;
  instructions: string;
  isOpen: boolean;
}

export interface Trainer {
  id: string;
  name: string;
  geography: Geography;
  loginId: string;
  active: boolean;
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
  openedAt: number;
  deadlineAt: number;
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

export interface StagePassRate {
  passed: number;
  assessed: number;
}

export interface ChannelFunnelRow {
  source: RecruitmentSource;
  signups: number;
  passRates: Record<AssessmentStage, StagePassRate>;
  selected: number;
  conversion: number;
}

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  subtitle: string;
  geography?: Geography;
}
