import { SessionUser, UserRole } from '@/domain/interface';

export const RECRUITER_A_SESSION: SessionUser = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Alex Morgan',
  role: UserRole.Recruiter,
  subtitle: 'BrightPath Recruitment',
  accesses: [],
};

export const RECRUITER_B_SESSION: SessionUser = {
  id: '10000000-0000-4000-8000-000000000002',
  name: 'Jamie Lee',
  role: UserRole.Recruiter,
  subtitle: 'Horizon Recruitment',
  accesses: [],
};

export const BUSINESS_SESSION: SessionUser = {
  id: 'google-1',
  name: 'Business team',
  role: UserRole.Business,
  subtitle: 'business@urbancompany.com',
  accesses: [],
};

export const PARTNER_SESSION: SessionUser = {
  id: '20000000-0000-4000-8000-000000000001',
  name: 'Thandar Aung',
  role: UserRole.Partner,
  subtitle: '+6590000001',
  accesses: [],
};
