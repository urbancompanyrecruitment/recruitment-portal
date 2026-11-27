import dayjs from 'dayjs';
import { BackendAdminLock, BackendLock, BookableSlot } from '@/api/interface';
import { ISO_DATE_FORMAT } from '@/domain/constant';
import {
  AdminAccount,
  AdminRole,
  AdminStatus,
  Aggregator,
  Candidate,
  CookingFrequency,
  InactiveReason,
  InterviewCentre,
  InterviewCity,
  LockOrigin,
  LockState,
  PartnerNotification,
  PartnerNotificationType,
  PartnerStage,
  PartnerState,
  RecruiterStatus,
  RecruiterWithStats,
  RecruitmentSource,
} from '@/domain/interface';

const day = (offset: number) => dayjs().add(offset, 'day').format(ISO_DATE_FORMAT);

const HOUR_MS = 60 * 60 * 1000;

const ago = (hours: number) => new Date(Date.now() - hours * HOUR_MS).toISOString();

const ahead = (hours: number) => new Date(Date.now() + hours * HOUR_MS).toISOString();

const SINGAPORE_CITY = { country: 'Singapore', timeZone: 'Asia/Singapore', instructions: 'Arrive 15 minutes early.' };

export const SINGAPORE_CITIES: InterviewCity[] = [
  { ...SINGAPORE_CITY, key: 'tampines', name: 'Tampines', centre: 'Tampines Centre', address: 'Tampines Central' },
  { ...SINGAPORE_CITY, key: 'jurong-east', name: 'Jurong East', centre: 'Jurong East Centre', address: 'Jurong Gateway Road' },
];

export const MYANMAR_CITIES: InterviewCity[] = [
  {
    key: 'yangon',
    name: 'Yangon',
    country: 'Myanmar',
    timeZone: 'Asia/Yangon',
    centre: 'Yangon Centre',
    address: 'Downtown Yangon',
    instructions: 'Arrive 15 minutes early.',
  },
];

export const CITIES: InterviewCity[] = [...SINGAPORE_CITIES, ...MYANMAR_CITIES];

export const INTERVIEW_CENTRES: InterviewCentre[] = [
  {
    key: 'singapore',
    name: 'Singapore Interview Centre',
    country: 'Singapore',
    cityName: 'Singapore',
    address: '33 Maude Road #02-01, Singapore 208344',
    timeZone: 'Asia/Singapore',
  },
  {
    key: 'yangon',
    name: 'Yangon Interview Centre',
    country: 'Myanmar',
    cityName: 'Yangon',
    address: 'Ye Tagon Tower (Pang Hlaing Tower), Pann Hlaing St, Yangon, Myanmar',
    timeZone: 'Asia/Yangon',
  },
];

export const slotsFor = (cityKey: string): BookableSlot[] =>
  [1, 2].flatMap(offset =>
    ['09:00', '10:00'].map(time => ({
      id: `${cityKey}_${day(offset)}_${time}`,
      cityKey,
      date: day(offset),
      time,
      timeZone: 'Asia/Singapore',
      capacity: 4,
      seatsLeft: 3,
    })),
  );

const base = {
  comfortableWithDogs: true,
  deepCleaningExperience: true,
  cookingFrequency: CookingFrequency.Frequently,
  age: 30,
  referrer: undefined,
};

export const THANDAR: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000001',
  name: 'Thandar Aung',
  primaryPhone: '+6590000001',
  singaporePhone: '+6590000001',
  hasSingaporePhone: true,
  country: 'Singapore',
  city: 'Singapore',
  nationality: 'Myanmar',
  source: RecruitmentSource.TikTok,
  interviewCity: 'tampines',
  slotId: `tampines_${day(-2)}_09:00`,
  state: PartnerState.Verified,
  stage: PartnerStage.Verified,
  verified: true,
  verifiedAt: ago(24),
  onboarding: { leadId: 'lead-seed-1', leadCreatedAt: ago(200), approvedAt: ago(24) },
  createdAt: ago(200),
};

export const SITI: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000003',
  name: 'Siti Rahma',
  primaryPhone: '+6690000003',
  singaporePhone: '+6580000003',
  hasSingaporePhone: true,
  country: 'Others',
  city: 'Bangkok',
  nationality: 'Indonesia',
  source: RecruitmentSource.Recruiter,
  referrer: 'BrightPath Recruitment',
  interviewCity: 'jurong-east',
  slotId: `jurong-east_${day(-4)}_10:00`,
  state: PartnerState.Verified,
  stage: PartnerStage.Verified,
  verified: true,
  verifiedAt: ago(90),
  onboarding: { leadId: 'lead-seed-3', leadCreatedAt: ago(300), approvedAt: ago(90) },
  createdAt: ago(300),
};

export const ANA: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000005',
  name: 'Ana Reyes',
  primaryPhone: '+6590000005',
  singaporePhone: '+6590000005',
  hasSingaporePhone: true,
  country: 'Singapore',
  city: 'Singapore',
  nationality: 'Philippines',
  source: RecruitmentSource.TikTok,
  interviewCity: 'tampines',
  slotId: `tampines_${day(-2)}_09:00`,
  state: PartnerState.Placed,
  stage: PartnerStage.Placed,
  verified: true,
  verifiedAt: ago(48),
  hubName: 'Tampines East',
  onboarding: { leadId: 'lead-seed-5', leadCreatedAt: ago(120), approvedAt: ago(48) },
  createdAt: ago(120),
};

export const MIRA: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000008',
  name: 'Mira Santos',
  primaryPhone: '+6690000008',
  hasSingaporePhone: false,
  country: 'Others',
  city: 'Bangkok',
  nationality: 'Philippines',
  source: RecruitmentSource.TikTok,
  interviewCity: 'jurong-east',
  slotId: `jurong-east_${day(2)}_11:00`,
  state: PartnerState.SignedUp,
  stage: PartnerStage.Registered,
  verified: false,
  createdAt: ago(48),
};

export const LIN: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000012',
  name: 'Lin Lin Htet',
  primaryPhone: '+6590000012',
  singaporePhone: '+6590000012',
  hasSingaporePhone: true,
  country: 'Singapore',
  city: 'Singapore',
  nationality: 'Myanmar',
  source: RecruitmentSource.Facebook,
  interviewCity: 'tampines',
  slotId: `tampines_${day(1)}_09:00`,
  state: PartnerState.SignedUp,
  stage: PartnerStage.Registered,
  verified: false,
  onboarding: { leadId: 'lead-seed-12', leadCreatedAt: ago(2) },
  createdAt: ago(2),
};

export const KHIN: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000009',
  name: 'Khin Myo',
  primaryPhone: '+9590000009',
  hasSingaporePhone: false,
  country: 'Myanmar',
  city: 'Yangon',
  nationality: 'Myanmar',
  source: RecruitmentSource.TikTok,
  interviewCity: 'yangon',
  slotId: `yangon_${day(-4)}_10:00`,
  state: PartnerState.VerificationFailed,
  stage: PartnerStage.VerificationFailed,
  verified: false,
  createdAt: ago(100),
};

export const CANDIDATES: Candidate[] = [THANDAR, SITI, ANA, MIRA, LIN, KHIN];

export const withoutContactDetails = (candidate: Candidate): Candidate => ({
  ...candidate,
  primaryPhone: undefined,
  singaporePhone: undefined,
});

const approvedRecruiter = { status: RecruiterStatus.Active, active: true, selfRegistered: false, createdAt: ago(500) };

const RECRUITER_A_ID = '10000000-0000-4000-8000-000000000001';

const RECRUITER_B_ID = '10000000-0000-4000-8000-000000000002';

export const AGGREGATORS: Aggregator[] = [
  { id: '40000000-0000-4000-8000-000000000001', recruiterId: RECRUITER_A_ID, name: 'CleanSpace Services', createdAt: ago(400) },
  { id: '40000000-0000-4000-8000-000000000002', recruiterId: RECRUITER_A_ID, name: 'HomeCare Collective', createdAt: ago(300) },
];

export const RECRUITERS: RecruiterWithStats[] = [
  {
    ...approvedRecruiter,
    id: RECRUITER_A_ID,
    name: 'Alex Morgan',
    email: 'alex.morgan@brightpath.sg',
    company: 'BrightPath Recruitment',
    lastLoginAt: ago(3),
    locksAcquired: 7,
    placementsSubmitted: 2,
    aggregators: AGGREGATORS,
  },
  {
    ...approvedRecruiter,
    id: RECRUITER_B_ID,
    name: 'Jamie Lee',
    email: 'jamie.lee@horizon.sg',
    company: 'Horizon Recruitment',
    locksAcquired: 4,
    placementsSubmitted: 0,
    aggregators: [],
  },
];

export const PENDING_RECRUITER: RecruiterWithStats = {
  id: '10000000-0000-4000-8000-000000000003',
  name: 'Priya Nair',
  email: 'priya.nair@swiftstaff.sg',
  company: 'SwiftStaff Agency',
  status: RecruiterStatus.Pending,
  active: false,
  selfRegistered: true,
  createdAt: ago(5),
  locksAcquired: 0,
  placementsSubmitted: 0,
  aggregators: [],
};

export const ALL_RECRUITERS: RecruiterWithStats[] = [...RECRUITERS, PENDING_RECRUITER];

export const ACTIVE_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000001',
  partnerId: THANDAR.id,
  recruiterId: RECRUITERS[0].id,
  origin: LockOrigin.Recruiter,
  lockedAt: ago(1),
  lockReleaseAt: ahead(71),
  state: LockState.Active,
};

export const REGISTRATION_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000004',
  partnerId: SITI.id,
  recruiterId: RECRUITERS[0].id,
  origin: LockOrigin.Registration,
  lockedAt: ago(90),
  state: LockState.Active,
};

export const PLACED_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000002',
  partnerId: ANA.id,
  recruiterId: RECRUITERS[0].id,
  origin: LockOrigin.Admin,
  lockedAt: ago(30),
  lockReleaseAt: ahead(42),
  state: LockState.Inactive,
  inactiveReason: InactiveReason.Placed,
  inactiveAt: ago(28),
  employerName: 'HomeCare Collective',
  aggregatorId: AGGREGATORS[1].id,
  startDate: day(10),
  placementRecordedAt: ago(28),
};

export const EXPIRED_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000003',
  partnerId: SITI.id,
  recruiterId: RECRUITERS[1].id,
  origin: LockOrigin.Recruiter,
  lockedAt: ago(120),
  lockReleaseAt: ago(48),
  state: LockState.Inactive,
  inactiveReason: InactiveReason.Expired,
  inactiveAt: ago(60),
};

export const ADMIN_LOCKS: BackendAdminLock[] = [
  { ...ACTIVE_LOCK, partnerName: THANDAR.name, recruiterName: RECRUITERS[0].name, recruiterCompany: RECRUITERS[0].company },
  { ...PLACED_LOCK, partnerName: ANA.name, recruiterName: RECRUITERS[0].name, recruiterCompany: RECRUITERS[0].company },
  { ...EXPIRED_LOCK, partnerName: SITI.name, recruiterName: RECRUITERS[1].name, recruiterCompany: RECRUITERS[1].company },
];

export const ADMIN_PROFILE: AdminAccount = {
  id: '50000000-0000-4000-8000-000000000001',
  name: 'Local Admin',
  email: 'admin@example.com',
  role: AdminRole.SuperAdmin,
  status: AdminStatus.Active,
  active: true,
  lastLoginAt: ago(1),
  createdAt: ago(900),
};

export const OPS_ADMIN: AdminAccount = {
  id: '50000000-0000-4000-8000-000000000002',
  name: 'Ops Admin',
  email: 'ops@example.com',
  role: AdminRole.Admin,
  status: AdminStatus.Active,
  active: true,
  createdAt: ago(300),
};

export const ADMIN_ACCOUNTS: AdminAccount[] = [ADMIN_PROFILE, OPS_ADMIN];

export const REGISTERED_BY_ALEX: Candidate = {
  ...MIRA,
  id: '20000000-0000-4000-8000-000000000013',
  name: 'Dewi Lestari',
  primaryPhone: '+6290000013',
  source: RecruitmentSource.Recruiter,
  referrer: 'Alex Morgan',
  registeredBy: { recruiterId: RECRUITER_A_ID, name: 'Alex Morgan', company: 'BrightPath Recruitment' },
};

export const NOTIFICATIONS: PartnerNotification[] = [
  {
    id: '50000001-0000-4000-8000-000000000002',
    type: PartnerNotificationType.Placement,
    data: { aggregatorName: 'HomeCare Collective', startDate: day(10) },
    read: false,
    createdAt: ago(2),
  },
  { id: '50000001-0000-4000-8000-000000000001', type: PartnerNotificationType.Verified, read: true, createdAt: ago(24) },
];
