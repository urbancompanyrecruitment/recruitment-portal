import {
  AdminAccount,
  AdminRole,
  Candidate,
  CookingFrequency,
  HubRowOutcome,
  SlotRowOutcome,
  ImportRowOutcome,
  InterviewSlot,
  LockOrigin,
  PartnerCountry,
  PartnerNotification,
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

export interface PartnerDetailsInput {
  firstName: string;
  lastName: string;
  primaryPhone: string;
  singaporePhone?: string;
  country: PartnerCountry;
  city: string;
  nationality: string;
  age: number;
  comfortableWithDogs: boolean;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: boolean;
  consent: boolean;
  interviewCity: string;
  slotId: string;
}

export interface RegistrationInput extends PartnerDetailsInput {
  source: RecruitmentSource;
  referrer?: string;
}

export interface RescheduleInput {
  interviewCity: string;
  slotId: string;
}

export interface NotificationList {
  notifications: PartnerNotification[];
  unreadCount: number;
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
  hasSingaporePhone?: SingaporePhoneFilter;
}

export type SingaporePhoneFilter = 'true' | 'false';

export interface VerificationUploadRow {
  primaryPhone: string;
  verified: string;
}

export interface ImportCounts {
  rows: number;
  accepted: number;
  rejected: number;
  errors: number;
}

export interface ImportRow extends VerificationUploadRow {
  rowNumber: number;
  outcome: ImportRowOutcome;
  candidateId?: string;
}

export interface VerifiedImportResult {
  importId: string;
  fileName: string;
  counts: ImportCounts;
  rows: ImportRow[];
}

export interface HubUploadRow {
  primaryPhone: string;
  hubName: string;
}

export interface HubImportRow extends HubUploadRow {
  rowNumber: number;
  outcome: HubRowOutcome;
  partnerId?: string;
}

export interface HubImportResult {
  fileName: string;
  counts: { rows: number; updated: number; errors: number };
  rows: HubImportRow[];
}

export interface SlotUploadRow {
  centre: string;
  startTime: string;
  endTime: string;
  capacity: string;
}

export interface SlotImportRow extends SlotUploadRow {
  rowNumber: number;
  outcome: SlotRowOutcome;
}

export interface SlotImportCounts {
  rows: number;
  created: number;
  updated: number;
  errors: number;
}

export interface SlotImportResult {
  fileName: string;
  counts: SlotImportCounts;
  rows: SlotImportRow[];
}

export type AvailableCandidate = Candidate;

export interface ReservedCandidate {
  candidate: Candidate;
  reservation: Reservation;
}

export interface PlacementInput {
  startDate: string;
  aggregatorId: string;
}

export interface RecruiterInput {
  name: string;
  company: string;
  email: string;
}

export interface RecruiterSignUpInput extends RecruiterInput {
  password: string;
}

export interface CreatedRecruiter {
  recruiter: Recruiter;
  temporaryPassword: string;
}

export interface AdminInput {
  name: string;
  email: string;
  role: AdminRole;
}

export interface CreatedAdmin {
  admin: AdminAccount;
  temporaryPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface TemporaryPasswordResult {
  temporaryPassword: string;
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
  origin: LockOrigin;
  lockedAt: string;
  lockReleaseAt?: string;
  state: Reservation['state'];
  inactiveReason?: Reservation['inactiveReason'];
  inactiveAt?: string;
  employerName?: string;
  aggregatorId?: string;
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

export interface BackendImportRow extends VerificationUploadRow {
  rowNumber: number;
  outcome: ImportRowOutcome;
  partnerId?: string;
}

export interface BackendImportResult {
  importId: string;
  fileName: string;
  counts: ImportCounts;
  rows: BackendImportRow[];
}
