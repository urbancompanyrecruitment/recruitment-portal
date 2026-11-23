import { Candidate, Reservation } from '@/domain/interface';
import { API_PATH } from './constant';
import { request, requestText } from './http';
import {
  BackendImportResult,
  BackendLock,
  BackendPartnerStatus,
  BackendSignUpResult,
  CandidateFilters,
  HubImportResult,
  HubUploadRow,
  NotificationList,
  PartnerDetailsInput,
  PartnerStatus,
  RegistrationInput,
  RegistrationResult,
  RescheduleInput,
  VerificationUploadRow,
  VerifiedImportResult,
} from './interface';
import { toReservation } from './reservations';

const toQuery = (filters: CandidateFilters): string => {
  const params = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();

  return params ? `?${params}` : '';
};

const toPartnerStatus = (status: BackendPartnerStatus): PartnerStatus => ({
  candidate: status.partner,
  slot: status.slot,
  stage: status.partner.stage,
});

export const listCandidates = (filters: CandidateFilters = {}): Promise<Candidate[]> =>
  request<Candidate[]>(`${API_PATH.adminPartners}${toQuery(filters)}`);

export const exportCandidatesCsv = (filters: CandidateFilters = {}): Promise<string> =>
  requestText(`${API_PATH.adminPartnersExport}${toQuery(filters)}`);

export const exportOpsLeadUploadCsv = (filters: CandidateFilters = {}): Promise<string> =>
  requestText(`${API_PATH.adminPartnersOpsUpload}${toQuery(filters)}`);

export const registerCandidate = async (input: RegistrationInput): Promise<RegistrationResult> => {
  const result = await request<BackendSignUpResult>(API_PATH.signUp, { method: 'POST', body: input });

  return { candidate: result.partner, slot: result.slot };
};

export const registerCandidateAsRecruiter = async (input: PartnerDetailsInput): Promise<RegistrationResult> => {
  const result = await request<BackendSignUpResult>(API_PATH.recruiterPartners, { method: 'POST', body: input });

  return { candidate: result.partner, slot: result.slot };
};

export const listRegisteredCandidates = (): Promise<Candidate[]> => request<Candidate[]>(API_PATH.registeredPartners);

export const getPartnerStatus = async (): Promise<PartnerStatus> =>
  toPartnerStatus(await request<BackendPartnerStatus>(API_PATH.partnerStatus));

export const reschedulePartnerSlot = async (input: RescheduleInput): Promise<PartnerStatus> =>
  toPartnerStatus(await request<BackendPartnerStatus>(API_PATH.partnerReschedule, { method: 'POST', body: input }));

export const listPartnerNotifications = (): Promise<NotificationList> => request<NotificationList>(API_PATH.partnerNotifications);

export const markPartnerNotificationsRead = (): Promise<void> =>
  request<void>(API_PATH.partnerNotificationsRead, { method: 'POST' });

export const updateSingaporePhone = (candidateId: string, singaporePhone: string): Promise<Candidate> =>
  request<Candidate>(API_PATH.singaporePhone(candidateId), { method: 'PUT', body: { singaporePhone } });

export const assignCandidateToRecruiter = async (candidateId: string, recruiterId: string): Promise<Reservation> =>
  toReservation(await request<BackendLock>(API_PATH.assignRecruiter(candidateId), { method: 'POST', body: { recruiterId } }));

export const markCandidateJoined = (candidateId: string): Promise<Candidate> =>
  request<Candidate>(API_PATH.markJoined(candidateId), { method: 'POST' });

export const importVerifiedCandidates = async (rows: VerificationUploadRow[], fileName: string): Promise<VerifiedImportResult> => {
  const result = await request<BackendImportResult>(API_PATH.verificationImports, {
    method: 'POST',
    body: { fileName, rows },
  });

  return {
    importId: result.importId,
    fileName: result.fileName,
    counts: result.counts,
    rows: result.rows.map(({ partnerId, ...row }) => ({ ...row, candidateId: partnerId })),
  };
};

export const importHubs = (rows: HubUploadRow[], fileName: string): Promise<HubImportResult> =>
  request<HubImportResult>(API_PATH.hubImports, { method: 'POST', body: { fileName, rows } });
