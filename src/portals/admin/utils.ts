import { CandidateFilters } from '@/api/interface';
import { AdminReservation, Candidate, LabelledOption } from '@/domain/interface';
import { LockFilters } from './interface';

export const toPercent = (part: number, total: number): number => (total ? Math.round((part / total) * 100) : 0);

export const filterCandidates = (candidates: Candidate[], { cityKey, source, state, hasSingaporePhone }: CandidateFilters): Candidate[] =>
  candidates.filter(
    candidate =>
      (!cityKey || candidate.interviewCity === cityKey) &&
      (!source || candidate.source === source) &&
      (!state || candidate.state === state) &&
      (!hasSingaporePhone || String(candidate.hasSingaporePhone) === hasSingaporePhone),
  );

export const filterLocks = (locks: AdminReservation[], { recruiterId, state, origin }: LockFilters): AdminReservation[] =>
  locks.filter(
    lock => (!recruiterId || lock.recruiterId === recruiterId) && (!state || lock.state === state) && (!origin || lock.origin === origin),
  );

export const lockRecruiterOptions = (locks: AdminReservation[]): LabelledOption<string>[] =>
  [...new Map(locks.map(lock => [lock.recruiterId, `${lock.recruiterName} · ${lock.recruiterCompany}`])).entries()]
    .map(([value, label]) => ({ value, label }))
    .toSorted((a, b) => a.label.localeCompare(b.label));
