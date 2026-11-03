import { DashboardUser } from '@/api/interface';
import { SessionUser, UserRole } from '@/domain/interface';

export const RECRUITER_A_SESSION: SessionUser = {
  id: 'r-a',
  name: 'Alex Morgan',
  role: UserRole.Recruiter,
  subtitle: 'BrightPath Recruitment',
  accesses: [],
};

export const RECRUITER_B_SESSION: SessionUser = {
  id: 'r-b',
  name: 'Jamie Lee',
  role: UserRole.Recruiter,
  subtitle: 'Horizon Recruitment',
  accesses: [],
};

export const BUSINESS_SESSION: SessionUser = {
  id: 'u-1',
  name: 'Business team',
  role: UserRole.Business,
  subtitle: 'business@urbancompany.com',
  accesses: [],
};

export const BUSINESS_TOKEN = 'jwt-business-1';

export const DASHBOARD_USER_RESPONSE: DashboardUser = {
  _id: 'u-1',
  name: 'Business team',
  email: 'business@urbancompany.com',
  role: ['user'],
  team: ['RECRUITMENT_DASHBOARD'],
};
