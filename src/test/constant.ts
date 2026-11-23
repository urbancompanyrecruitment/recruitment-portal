import { AdminRole, SessionUser, UserRole } from '@/domain/interface';

export const RECRUITER_A_SESSION: SessionUser = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Alex Morgan',
  role: UserRole.Recruiter,
  subtitle: 'BrightPath Recruitment · alex.morgan@brightpath.sg',
  approved: true,
};

export const RECRUITER_B_SESSION: SessionUser = {
  id: '10000000-0000-4000-8000-000000000002',
  name: 'Jamie Lee',
  role: UserRole.Recruiter,
  subtitle: 'Horizon Recruitment · jamie.lee@horizon.sg',
  approved: true,
};

export const RECRUITER_PENDING_SESSION: SessionUser = {
  id: '10000000-0000-4000-8000-000000000003',
  name: 'Priya Nair',
  role: UserRole.Recruiter,
  subtitle: 'SwiftStaff Agency · priya.nair@swiftstaff.sg',
  approved: false,
};

export const ADMIN_SESSION: SessionUser = {
  id: '50000000-0000-4000-8000-000000000001',
  name: 'Local Admin',
  role: UserRole.Admin,
  subtitle: 'admin@example.com',
  approved: true,
  adminRole: AdminRole.SuperAdmin,
};

export const OPS_ADMIN_SESSION: SessionUser = {
  id: '50000000-0000-4000-8000-000000000002',
  name: 'Ops Admin',
  role: UserRole.Admin,
  subtitle: 'ops@example.com',
  approved: true,
  adminRole: AdminRole.Admin,
};

export const PARTNER_SESSION: SessionUser = {
  id: '20000000-0000-4000-8000-000000000001',
  name: 'Thandar Aung',
  role: UserRole.Partner,
  subtitle: '+6590000001',
  approved: true,
};
