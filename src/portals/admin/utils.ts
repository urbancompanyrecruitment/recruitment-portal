import { CandidateFilters } from '@/api/interface';
import { Candidate } from '@/domain/interface';

export const toPercent = (part: number, total: number): number => (total ? Math.round((part / total) * 100) : 0);

export const filterCandidates = (candidates: Candidate[], { cityKey, source, state }: CandidateFilters): Candidate[] =>
  candidates.filter(
    candidate =>
      (!cityKey || candidate.interviewCity === cityKey) && (!source || candidate.source === source) && (!state || candidate.state === state),
  );
