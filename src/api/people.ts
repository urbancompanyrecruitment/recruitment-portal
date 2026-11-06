import { Aggregator, Recruiter } from '@/domain/interface';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR } from './constant';
import { RecruiterInput } from './interface';

export const listRecruiters = (): Promise<Recruiter[]> => mockQuery(db => db.recruiters);

export const createRecruiter = (input: RecruiterInput): Promise<Recruiter> =>
  mockMutation(db => {
    if (db.recruiters.some(recruiter => recruiter.loginId === input.loginId)) throw new Error(API_ERROR.duplicateLogin);

    const recruiter: Recruiter = { ...input, id: crypto.randomUUID(), active: true };

    return { db: { ...db, recruiters: [...db.recruiters, recruiter] }, result: recruiter };
  });

export const toggleRecruiterAccess = (recruiterId: string): Promise<Recruiter> =>
  mockMutation(db => {
    const current = findOrThrow(db.recruiters, recruiter => recruiter.id === recruiterId, API_ERROR.recruiterNotFound);
    const next = { ...current, active: !current.active };

    return {
      db: { ...db, recruiters: db.recruiters.map(recruiter => (recruiter.id === recruiterId ? next : recruiter)) },
      result: next,
    };
  });

export const listAggregators = (): Promise<Aggregator[]> => mockQuery(db => db.aggregators);

export const updateAggregatorQuota = (aggregatorId: string, quota: number): Promise<Aggregator> =>
  mockMutation(db => {
    if (quota < 0) throw new Error(API_ERROR.invalidQuota);

    const current = findOrThrow(db.aggregators, item => item.id === aggregatorId, API_ERROR.aggregatorNotFound);
    const next = { ...current, quota };

    return {
      db: { ...db, aggregators: db.aggregators.map(item => (item.id === aggregatorId ? next : item)) },
      result: next,
    };
  });
