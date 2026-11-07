import { Recruiter, RecruiterStatus } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { CreatedRecruiter, RecruiterInput } from './interface';

export const listRecruiters = (): Promise<Recruiter[]> => request<Recruiter[]>(API_PATH.adminRecruiters);

export const createRecruiter = (input: RecruiterInput): Promise<CreatedRecruiter> =>
  request<CreatedRecruiter>(API_PATH.adminRecruiters, { method: 'POST', body: input });

export const setRecruiterStatus = (recruiterId: string, status: RecruiterStatus): Promise<Recruiter> =>
  request<Recruiter>(API_PATH.recruiterStatus(recruiterId), { method: 'PUT', body: { status } });
