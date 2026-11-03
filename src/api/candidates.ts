import { PENDING_RESULTS } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { Candidate, InvitationStatus, ProviderCategory } from '@/domain/interface';
import { listBookableSlots } from '@/domain/slot';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR, NON_DIGITS } from './constant';
import { RegistrationDetails, RegistrationInput } from './interface';

export const listCandidates = (): Promise<Candidate[]> => mockQuery(db => db.candidates);

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
  mockMutation(db => {
    const current = findOrThrow(db.candidates, candidate => candidate.id === candidateId, API_ERROR.candidateNotFound);
    const next = { ...current, l1Completed: true, invitationStatus: InvitationStatus.Completed };

    return {
      db: { ...db, candidates: db.candidates.map(candidate => (candidate.id === candidateId ? next : candidate)) },
      result: next,
    };
  });
