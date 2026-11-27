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
  Admin = 'admin',
}

export enum AdminRole {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
}

export enum AdminStatus {
  Active = 'active',
  Suspended = 'suspended',
}

export enum PartnerCountry {
  Singapore = 'Singapore',
  Myanmar = 'Myanmar',
  Others = 'Others',
}

export enum PartnerState {
  SignedUp = 'signed_up',
  Verified = 'verified',
  VerificationFailed = 'verification_failed',
  Placed = 'placed',
  Joined = 'joined',
}

export enum PartnerStage {
  Registered = 'registered',
  Verified = 'verified',
  VerificationFailed = 'verification_failed',
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

export enum LockOrigin {
  Recruiter = 'recruiter',
  Registration = 'registration',
  Admin = 'admin',
}

export enum PartnerNotificationType {
  Verified = 'verified',
  Placement = 'placement',
}

export enum ReservationStatus {
  AwaitingPlacement = 'awaiting-placement',
  Placed = 'placed',
}

export enum RecruiterStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
  Rejected = 'rejected',
}

export enum ImportRowOutcome {
  Accepted = 'accepted',
  Rejected = 'rejected',
  InvalidPhone = 'invalid_phone',
  InvalidVerified = 'invalid_verified',
  DuplicateInFile = 'duplicate_in_file',
  NotFound = 'not_found',
  AlreadyVerified = 'already_verified',
  AlreadyFailed = 'already_failed',
  NoSingaporeNumber = 'no_singapore_number',
  ApprovalFailed = 'approval_failed',
}

export enum SlotRowOutcome {
  Created = 'created',
  Updated = 'updated',
  UnknownCentre = 'unknown_centre',
  InvalidTime = 'invalid_time',
  InvalidEndTime = 'invalid_end_time',
  InvalidCapacity = 'invalid_capacity',
  DuplicateInFile = 'duplicate_in_file',
}

export interface InterviewCentre {
  key: string;
  name: string;
  country: string;
  cityName: string;
  address: string;
  timeZone: string;
}

export enum HubRowOutcome {
  Updated = 'updated',
  InvalidPhone = 'invalid_phone',
  MissingHub = 'missing_hub',
  DuplicateInFile = 'duplicate_in_file',
  NotFound = 'not_found',
  NotEligible = 'not_eligible',
}

export interface InterviewCity {
  key: string;
  name: string;
  country: string;
  centre: string;
  address: string;
  instructions: string;
  timeZone: string;
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

export interface CandidateRegistrar {
  recruiterId: string;
  name: string;
  company: string;
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
  registeredBy?: CandidateRegistrar;
  comfortableWithDogs: boolean;
  deepCleaningExperience: boolean;
  cookingFrequency: CookingFrequency;
  interviewCity: string;
  slotId?: string;
  state: PartnerState;
  stage: PartnerStage;
  verified: boolean;
  verifiedAt?: string;
  hubName?: string;
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
  selfRegistered: boolean;
  lastLoginAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Aggregator {
  id: string;
  recruiterId: string;
  name: string;
  createdAt: string;
}

export interface RecruiterWithStats extends Recruiter {
  locksAcquired: number;
  placementsSubmitted: number;
  aggregators: Aggregator[];
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  candidateId: string;
  recruiterId: string;
  origin: LockOrigin;
  lockedAt: number;
  lockReleaseAt?: number;
  state: LockState;
  inactiveReason?: InactiveReason;
  inactiveAt?: number;
  employerName?: string;
  aggregatorId?: string;
  startDate?: string;
  placementRecordedAt?: number;
}

export interface PartnerNotification {
  id: string;
  type: PartnerNotificationType;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
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
  approved: boolean;
  adminRole?: AdminRole;
  recruiterStatus?: RecruiterStatus;
}

export interface TagStyle {
  label: string;
  color?: string;
}

export enum YesNoFilter {
  Yes = 'yes',
  No = 'no',
}

export interface LabelledOption<T> {
  value: T;
  label: string;
}
