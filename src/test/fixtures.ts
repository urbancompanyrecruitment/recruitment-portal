import dayjs from 'dayjs';
import { BackendAdminLock, BackendLock, BookableSlot } from '@/api/interface';
import { ISO_DATE_FORMAT } from '@/domain/constant';
import {
  Candidate,
  CookingFrequency,
  InactiveReason,
  InterviewCity,
  LockState,
  PartnerStage,
  PartnerState,
  Recruiter,
  RecruiterStatus,
  RecruitmentSource,
} from '@/domain/interface';

const day = (offset: number) => dayjs().add(offset, 'day').format(ISO_DATE_FORMAT);

const HOUR_MS = 60 * 60 * 1000;

const ago = (hours: number) => new Date(Date.now() - hours * HOUR_MS).toISOString();

const ahead = (hours: number) => new Date(Date.now() + hours * HOUR_MS).toISOString();

export const CITIES: InterviewCity[] = [
  { key: 'tampines', name: 'Tampines', centre: 'UC Tampines Centre', address: 'Tampines Central', instructions: 'Arrive 15 minutes early.' },
  { key: 'jurong-east', name: 'Jurong East', centre: 'UC Jurong East Centre', address: 'Jurong Gateway Road', instructions: 'Arrive 15 minutes early.' },
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
  country: 'Thailand',
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
  onboarding: { leadId: 'lead-seed-5', leadCreatedAt: ago(120), approvedAt: ago(48) },
  createdAt: ago(120),
};

export const MIRA: Candidate = {
  ...base,
  id: '20000000-0000-4000-8000-000000000008',
  name: 'Mira Santos',
  primaryPhone: '+6690000008',
  hasSingaporePhone: false,
  country: 'Thailand',
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

export const CANDIDATES: Candidate[] = [THANDAR, SITI, ANA, MIRA, LIN];

export const withoutPhones = (candidate: Candidate): Candidate => ({ ...candidate, primaryPhone: undefined, singaporePhone: undefined });

export const RECRUITERS: Recruiter[] = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Alex Morgan', email: 'alex.morgan@brightpath.sg', company: 'BrightPath Recruitment', status: RecruiterStatus.Active, active: true, createdAt: ago(500) },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Jamie Lee', email: 'jamie.lee@horizon.sg', company: 'Horizon Recruitment', status: RecruiterStatus.Active, active: true, createdAt: ago(500) },
];

export const ACTIVE_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000001',
  partnerId: THANDAR.id,
  recruiterId: RECRUITERS[0].id,
  lockedAt: ago(1),
  lockReleaseAt: ahead(47),
  state: LockState.Active,
};

export const PLACED_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000002',
  partnerId: ANA.id,
  recruiterId: RECRUITERS[0].id,
  lockedAt: ago(30),
  lockReleaseAt: ahead(18),
  state: LockState.Inactive,
  inactiveReason: InactiveReason.Placed,
  inactiveAt: ago(28),
  employerName: 'HomeCare Collective',
  startDate: day(10),
  placementRecordedAt: ago(28),
};

export const EXPIRED_LOCK: BackendLock = {
  id: '30000000-0000-4000-8000-000000000003',
  partnerId: SITI.id,
  recruiterId: RECRUITERS[1].id,
  lockedAt: ago(120),
  lockReleaseAt: ago(72),
  state: LockState.Inactive,
  inactiveReason: InactiveReason.Expired,
  inactiveAt: ago(60),
};

export const ADMIN_LOCKS: BackendAdminLock[] = [
  { ...ACTIVE_LOCK, partnerName: THANDAR.name, recruiterName: RECRUITERS[0].name, recruiterCompany: RECRUITERS[0].company },
  { ...PLACED_LOCK, partnerName: ANA.name, recruiterName: RECRUITERS[0].name, recruiterCompany: RECRUITERS[0].company },
  { ...EXPIRED_LOCK, partnerName: SITI.name, recruiterName: RECRUITERS[1].name, recruiterCompany: RECRUITERS[1].company },
];

export const ADMIN_PROFILE = { id: 'google-1', name: 'Business team', email: 'business@urbancompany.com' };
