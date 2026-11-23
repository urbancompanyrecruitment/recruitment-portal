import { AdminAccount, AdminStatus, Aggregator, Recruiter, RecruiterStatus, RecruiterWithStats } from '@/domain/interface';
import { API_PATH } from './constant';
import { request } from './http';
import { AdminInput, CreatedAdmin, CreatedRecruiter, RecruiterInput, TemporaryPasswordResult } from './interface';

export const listRecruiters = (): Promise<RecruiterWithStats[]> => request<RecruiterWithStats[]>(API_PATH.adminRecruiters);

export const createRecruiter = (input: RecruiterInput): Promise<CreatedRecruiter> =>
  request<CreatedRecruiter>(API_PATH.adminRecruiters, { method: 'POST', body: input });

export const setRecruiterStatus = (recruiterId: string, status: RecruiterStatus): Promise<Recruiter> =>
  request<Recruiter>(API_PATH.recruiterStatus(recruiterId), { method: 'PUT', body: { status } });

export const resetRecruiterPassword = (recruiterId: string): Promise<TemporaryPasswordResult> =>
  request<TemporaryPasswordResult>(API_PATH.resetRecruiterPassword(recruiterId), { method: 'POST' });

export const addRecruiterAggregator = (recruiterId: string, name: string): Promise<Aggregator> =>
  request<Aggregator>(API_PATH.recruiterAggregators(recruiterId), { method: 'POST', body: { name } });

export const removeRecruiterAggregator = (recruiterId: string, aggregatorId: string): Promise<void> =>
  request<void>(API_PATH.recruiterAggregator(recruiterId, aggregatorId), { method: 'DELETE' });

export const listAdmins = (): Promise<AdminAccount[]> => request<AdminAccount[]>(API_PATH.adminAccounts);

export const createAdmin = (input: AdminInput): Promise<CreatedAdmin> =>
  request<CreatedAdmin>(API_PATH.adminAccounts, { method: 'POST', body: input });

export const setAdminStatus = (adminId: string, status: AdminStatus): Promise<AdminAccount> =>
  request<AdminAccount>(API_PATH.adminAccountStatus(adminId), { method: 'PUT', body: { status } });

export const resetAdminPassword = (adminId: string): Promise<TemporaryPasswordResult> =>
  request<TemporaryPasswordResult>(API_PATH.resetAdminPassword(adminId), { method: 'POST' });
