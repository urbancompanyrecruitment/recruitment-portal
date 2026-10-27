import { Geography, SessionUser, UserRole } from '@/domain/interface';

export const TRAINER_SG_SESSION: SessionUser = {
  id: 't-sg',
  name: 'Sarah Tan',
  role: UserRole.Trainer,
  subtitle: Geography.Singapore,
  geography: Geography.Singapore,
};

export const RECRUITER_A_SESSION: SessionUser = {
  id: 'r-a',
  name: 'Alex Morgan',
  role: UserRole.Recruiter,
  subtitle: 'BrightPath Recruitment',
};

export const RECRUITER_B_SESSION: SessionUser = {
  id: 'r-b',
  name: 'Jamie Lee',
  role: UserRole.Recruiter,
  subtitle: 'Horizon Recruitment',
};

export const BUSINESS_SESSION: SessionUser = {
  id: 'business-admin',
  name: 'Business team',
  role: UserRole.Business,
  subtitle: 'Admin',
};
