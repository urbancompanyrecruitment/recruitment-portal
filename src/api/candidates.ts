import { Candidate } from '@/domain/interface';
import { API_PATH } from './constant';
import { request, requestText } from './http';
import {
  BackendImportResult,
  BackendPartnerStatus,
  BackendSignUpResult,
  CandidateFilters,
  PartnerStatus,
  RegistrationInput,
  RegistrationResult,
  TemporaryPasswordResult,
  VerifiedImportResult,
} from './interface';

const toQuery = (filters: CandidateFilters): string => {
  const params = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();

  return params ? `?${params}` : '';
};

export const listCandidates = (filters: CandidateFilters = {}): Promise<Candidate[]> =>
  request<Candidate[]>(`${API_PATH.adminPartners}${toQuery(filters)}`);

export const exportCandidatesCsv = (filters: CandidateFilters = {}): Promise<string> =>
  requestText(`${API_PATH.adminPartnersExport}${toQuery(filters)}`);

export const registerCandidate = async (input: RegistrationInput): Promise<RegistrationResult> => {
  const result = await request<BackendSignUpResult>(API_PATH.signUp, { method: 'POST', body: input });

  return { candidate: result.partner, slot: result.slot };
};

export const getPartnerStatus = async (): Promise<PartnerStatus> => {
  const status = await request<BackendPartnerStatus>(API_PATH.partnerStatus);

  return { candidate: status.partner, slot: status.slot, stage: status.partner.stage };
};

export const updateSingaporePhone = (candidateId: string, singaporePhone: string): Promise<Candidate> =>
  request<Candidate>(API_PATH.singaporePhone(candidateId), { method: 'PUT', body: { singaporePhone } });

export const resetPartnerPassword = (candidateId: string): Promise<TemporaryPasswordResult> =>
  request<TemporaryPasswordResult>(API_PATH.resetPassword(candidateId), { method: 'POST' });

export const markCandidateJoined = (candidateId: string): Promise<Candidate> =>
  request<Candidate>(API_PATH.markJoined(candidateId), { method: 'POST' });

export const importVerifiedCandidates = async (primaryPhones: string[], fileName: string): Promise<VerifiedImportResult> => {
  const result = await request<BackendImportResult>(API_PATH.verificationImports, {
    method: 'POST',
    body: { fileName, primaryPhones },
  });

  return {
    importId: result.importId,
    fileName: result.fileName,
    counts: result.counts,
    rows: result.rows.map(({ partnerId, ...row }) => ({ ...row, candidateId: partnerId })),
  };
};
