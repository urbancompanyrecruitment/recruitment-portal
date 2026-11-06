import dayjs from 'dayjs';
import { Candidate, ImportRowOutcome, ProviderCategory } from '@/domain/interface';
import { isValidSingaporePhone, phoneDigits } from '@/domain/phone';
import { getInterviewCity, listBookableSlots, parseSlotId } from '@/domain/slot';
import { MOCK_LEAD_ID_PREFIX, VERIFIED_BY_IMPORT } from '@/mocks/constant';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR } from './constant';
import { ImportRow, RegistrationInput, RegistrationResult, VerifiedImportResult } from './interface';

const createLead = (candidate: Candidate): Candidate => ({
  ...candidate,
  onboarding: { leadId: `${MOCK_LEAD_ID_PREFIX}${candidate.id.slice(0, 8)}`, leadCreatedAt: new Date().toISOString() },
});

const resolveImportOutcome = (
  digits: string,
  index: number,
  digitsList: string[],
  candidate: Candidate | undefined,
): ImportRowOutcome => {
  if (!digits) return ImportRowOutcome.InvalidPhone;

  if (digitsList.indexOf(digits) !== index) return ImportRowOutcome.DuplicateInFile;

  if (!candidate) return ImportRowOutcome.NotFound;

  if (candidate.verified) return ImportRowOutcome.AlreadyVerified;

  if (!candidate.singaporePhone || !isValidSingaporePhone(candidate.singaporePhone) || !candidate.onboarding) {
    return ImportRowOutcome.NoSingaporeNumber;
  }

  return ImportRowOutcome.Accepted;
};

export const listCandidates = (): Promise<Candidate[]> => mockQuery(db => db.candidates);

export const registerCandidate = (input: RegistrationInput): Promise<RegistrationResult> =>
  mockMutation(db => {
    const primaryDigits = phoneDigits(input.primaryPhone);
    const singaporePhone = input.singaporePhone?.trim() || undefined;

    if (db.candidates.some(candidate => phoneDigits(candidate.primaryPhone) === primaryDigits)) {
      throw new Error(API_ERROR.duplicatePhone);
    }

    if (singaporePhone && !isValidSingaporePhone(singaporePhone)) throw new Error(API_ERROR.invalidSingaporePhone);

    if (!getInterviewCity(input.interviewCity)) throw new Error(API_ERROR.unknownCity);

    const bookable = listBookableSlots(input.interviewCity, db.candidates, dayjs());

    if (input.slotId && !bookable.some(slot => slot.id === input.slotId)) throw new Error(API_ERROR.slotUnavailable);

    const registered: Candidate = {
      ...input,
      singaporePhone,
      id: crypto.randomUUID(),
      category: ProviderCategory.NotAssigned,
      yearsOfExperience: 0,
      bio: `Cooking: ${input.cookingFrequency}. Deep cleaning: ${input.deepCleaningExperience}. Comfortable around dogs: ${input.comfortableWithDogs}.`,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    const candidate = singaporePhone ? createLead(registered) : registered;

    return {
      db: { ...db, candidates: [...db.candidates, candidate] },
      result: { candidate, slot: candidate.slotId ? parseSlotId(candidate.slotId) : undefined },
    };
  });

export const updateSingaporePhone = (candidateId: string, singaporePhone: string): Promise<Candidate> =>
  mockMutation(db => {
    const trimmed = singaporePhone.trim();

    if (!isValidSingaporePhone(trimmed)) throw new Error(API_ERROR.invalidSingaporePhone);

    const current = findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound);
    const updated = { ...current, singaporePhone: trimmed };
    const next = current.onboarding ? updated : createLead(updated);

    return {
      db: { ...db, candidates: db.candidates.map(candidate => (candidate.id === candidateId ? next : candidate)) },
      result: next,
    };
  });

export const importVerifiedCandidates = (primaryPhones: string[], fileName: string): Promise<VerifiedImportResult> =>
  mockMutation(db => {
    const digitsList = primaryPhones.map(phoneDigits);
    const rows: ImportRow[] = primaryPhones.map((raw, index) => {
      const digits = digitsList[index];
      const candidate = db.candidates.find(item => phoneDigits(item.primaryPhone) === digits);

      return {
        rowNumber: index + 1,
        primaryPhone: raw.trim(),
        outcome: resolveImportOutcome(digits, index, digitsList, candidate),
        candidateId: candidate?.id,
      };
    });
    const acceptedIds = new Set(rows.filter(row => row.outcome === ImportRowOutcome.Accepted).map(row => row.candidateId));
    const verifiedAt = new Date().toISOString();
    const candidates = db.candidates.map(candidate =>
      acceptedIds.has(candidate.id)
        ? {
            ...candidate,
            verified: true,
            verifiedBy: VERIFIED_BY_IMPORT,
            verifiedAt,
            onboarding: candidate.onboarding && { ...candidate.onboarding, approvedAt: verifiedAt },
          }
        : candidate,
    );

    return {
      db: { ...db, candidates },
      result: {
        fileName,
        counts: { rows: rows.length, accepted: acceptedIds.size, failed: rows.length - acceptedIds.size },
        rows,
      },
    };
  });
