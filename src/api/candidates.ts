import { applyStageResult, canConfirmVerified, canRecordStage, confirmVerified } from '@/domain/assessment';
import { PENDING_RESULTS } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import {
  AssessmentStage,
  Candidate,
  Geography,
  InvitationStatus,
  ProviderCategory,
  StageResult,
} from '@/domain/interface';
import { listBookableSlots } from '@/domain/slot';
import { MockChange, MockDb } from '@/mocks/interface';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR, NON_DIGITS } from './constant';
import { RegistrationDetails, RegistrationInput } from './interface';

const updateCandidate = (
  db: MockDb,
  candidateId: string,
  update: (candidate: Candidate) => Candidate,
): MockChange<Candidate> => {
  const next = update(findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound));
  return {
    db: { ...db, candidates: db.candidates.map(candidate => (candidate.id === candidateId ? next : candidate)) },
    result: next,
  };
};

const createStamp = (by: string) => ({ id: crypto.randomUUID(), by, at: new Date().toISOString() });

export const listCandidates = (geography?: Geography): Promise<Candidate[]> =>
  mockQuery(db => db.candidates.filter(candidate => !geography || candidate.interviewGeography === geography));

export const getCandidate = (candidateId: string): Promise<Candidate> =>
  mockQuery(db => findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound));

export const getRegistration = (candidateId: string): Promise<RegistrationDetails> =>
  mockQuery(db => {
    const candidate = findOrThrow(db.candidates, item => item.id === candidateId, API_ERROR.candidateNotFound);
    return { candidate, slot: db.slots.find(slot => slot.id === candidate.slotId) };
  });

export const registerCandidate = (input: RegistrationInput): Promise<Candidate> =>
  mockMutation(db => {
    const phoneDigits = input.phone.replace(NON_DIGITS, '');
    if (db.candidates.some(candidate => candidate.phone.replace(NON_DIGITS, '') === phoneDigits)) {
      throw new Error(API_ERROR.duplicatePhone);
    }

    const bookable = listBookableSlots(db.slots, db.candidates, input.interviewGeography, toIsoDate());
    if (input.slotId && !bookable.some(slot => slot.id === input.slotId)) throw new Error(API_ERROR.slotUnavailable);

    const candidate: Candidate = {
      ...input,
      id: crypto.randomUUID(),
      category: ProviderCategory.NotAssigned,
      yearsOfExperience: 0,
      bio: `Cooking: ${input.cookingFrequency}. Deep cleaning: ${input.deepCleaningExperience}. Comfortable around dogs: ${input.comfortableWithDogs}.`,
      results: { ...PENDING_RESULTS },
      attempts: [],
      notes: [],
      verified: false,
      invitationStatus: InvitationStatus.Queued,
      l1Completed: false,
      createdAt: new Date().toISOString(),
    };

    return { db: { ...db, candidates: [...db.candidates, candidate] }, result: candidate };
  });

export const markL1Completed = (candidateId: string): Promise<Candidate> =>
  mockMutation(db =>
    updateCandidate(db, candidateId, candidate => ({
      ...candidate,
      l1Completed: true,
      invitationStatus: InvitationStatus.Completed,
    })),
  );

export const recordStageResult = (
  candidateId: string,
  stage: AssessmentStage,
  result: StageResult,
  trainerName: string,
): Promise<Candidate> =>
  mockMutation(db =>
    updateCandidate(db, candidateId, candidate => {
      if (!canRecordStage(candidate.results, stage)) throw new Error(API_ERROR.stageLocked);
      return applyStageResult(candidate, stage, result, createStamp(trainerName));
    }),
  );

export const addCandidateNote = (candidateId: string, text: string, by: string): Promise<Candidate> =>
  mockMutation(db =>
    updateCandidate(db, candidateId, candidate => ({
      ...candidate,
      notes: [...candidate.notes, { ...createStamp(by), text }],
    })),
  );

export const updateCandidateCategory = (candidateId: string, category: ProviderCategory): Promise<Candidate> =>
  mockMutation(db => updateCandidate(db, candidateId, candidate => ({ ...candidate, category })));

export const confirmCandidateVerified = (candidateId: string, trainerName: string): Promise<Candidate> =>
  mockMutation(db =>
    updateCandidate(db, candidateId, candidate => {
      if (!canConfirmVerified(candidate.results)) throw new Error(API_ERROR.verificationLocked);
      return confirmVerified(candidate, createStamp(trainerName));
    }),
  );
