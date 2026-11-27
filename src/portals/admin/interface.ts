import { ReactNode } from 'react';
import { CandidateFilters, HubUploadRow, SlotUploadRow, VerificationUploadRow } from '@/api/interface';
import {
  AdminAccount,
  AdminReservation,
  AdminRole,
  AdminStatus,
  Aggregator,
  Candidate,
  InterviewSlot,
  LockOrigin,
  LockState,
  RecruiterStatus,
  RecruiterWithStats,
} from '@/domain/interface';

export interface TrackerRow {
  candidate: Candidate;
  slot?: InterviewSlot;
  reservation?: AdminReservation;
}

export interface OverviewMetric {
  label: string;
  hint?: string;
  to?: string;
  matches: (candidate: Candidate) => boolean;
}

export interface CsvFileGuide {
  title: string;
  purpose: string;
  action: string;
  columns: string[];
  conditions: string[];
  sample?: CsvFileSample;
}

export interface CsvFileSample {
  fileName: string;
  rows: string[][];
}

export interface CsvFileCardProps {
  guide: CsvFileGuide;
  summary?: string;
  children: ReactNode;
}

export interface PartnerFiltersProps {
  value: CandidateFilters;
  onChange: (filters: CandidateFilters) => void;
  children?: ReactNode;
}

export interface LockFilters {
  recruiterId?: string;
  state?: LockState;
  origin?: LockOrigin;
}

export interface RecruiterTableFilters {
  status?: RecruiterStatus;
}

export interface AdminTableFilters {
  role?: AdminRole;
  status?: AdminStatus;
}

export interface StatusAction<Status> {
  label: string;
  next: Status;
  danger?: boolean;
}

export interface SingaporePhoneFormValues {
  singaporePhone: string;
}

export interface SingaporePhoneVariables {
  candidateId: string;
  singaporePhone: string;
}

export interface ImportVariables {
  rows: VerificationUploadRow[];
  fileName: string;
}

export interface SlotImportVariables {
  rows: SlotUploadRow[];
  fileName: string;
}

export interface HubImportVariables {
  rows: HubUploadRow[];
  fileName: string;
}

export interface RecruiterStatusVariables {
  recruiter: RecruiterWithStats;
  status: RecruiterStatus;
}

export interface AggregatorFormValues {
  name: string;
}

export interface AddAggregatorVariables {
  recruiterId: string;
  name: string;
}

export interface RemoveAggregatorVariables {
  recruiterId: string;
  aggregator: Aggregator;
}

export interface TagRecruiterFormValues {
  recruiterId: string;
}

export interface TagRecruiterVariables {
  candidateId: string;
  recruiterId: string;
}

export interface AdminStatusVariables {
  admin: AdminAccount;
  status: AdminStatus;
}

export interface AdminLoginFormValues {
  email: string;
  password: string;
}

export interface TemporaryPasswordNotice {
  name: string;
  account?: string;
  password: string;
}

export interface TemporaryPasswordModalProps {
  notice?: TemporaryPasswordNotice;
  onClose: () => void;
}

export enum AdminTool {
  SignedUpDownload = 'signed-up-download',
  OpsUploadDownload = 'ops-upload-download',
  VerifiedUpload = 'verified-upload',
  HubUpload = 'hub-upload',
  SlotUpload = 'slot-upload',
  CreateRecruiter = 'create-recruiter',
  CreateAdmin = 'create-admin',
}

export interface AdminToolConfig {
  label: string;
  title: string;
  subtitle: string;
  superAdminOnly?: boolean;
}

export interface AdminToolGroup {
  title: string;
  tools: AdminTool[];
}

export interface ToolPageProps {
  tool: AdminTool;
}

export type CandidateDownloadFile = 'signedUp' | 'opsUpload';

export interface CandidateDownloadProps {
  file: CandidateDownloadFile;
}
