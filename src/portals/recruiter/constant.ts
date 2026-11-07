import { ReservationStatus } from '@/domain/interface';
import { NavItem } from '@/shared/components/interface';
import {
  CandidateTab,
  CandidateTabConfig,
  DashboardMetric,
  DashboardStat,
  DemoAccount,
  ProfileComparator,
  ProfileFilters,
  ProfileSort,
  WorkflowStep,
} from './interface';

export const RECRUITER_WORKSPACE = 'Recruiter workspace';

export const RECRUITER_PATH = {
  dashboard: '/recruiter/dashboard',
  profiles: '/recruiter/profiles',
  myCandidates: '/recruiter/my-candidates',
  candidate: (candidateId: string) => `/recruiter/candidates/${candidateId}`,
};

export const RESERVATION_REFETCH_MS = 30_000;

export const RECRUITER_NAV_ITEMS: NavItem[] = [
  { path: RECRUITER_PATH.dashboard, label: 'Dashboard' },
  { path: RECRUITER_PATH.profiles, label: 'Available profiles' },
  { path: RECRUITER_PATH.myCandidates, label: 'My candidates' },
];

export const RECRUITER_DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Recruiter A · Alex Morgan', email: 'alex.morgan@brightpath.sg' },
  { label: 'Recruiter B · Jamie Lee', email: 'jamie.lee@horizon.sg' },
];

export const RECRUITER_LOGIN = {
  title: 'Welcome back',
  subtitle: 'Sign in to your recruitment workspace. Accounts are issued by the business team.',
  demoHeading: 'Explore with a seeded account',
  demoPasswordNote: 'Password for the seeded accounts:',
  accountNote: 'The business team creates your account and shares a temporary password with you.',
};

export const HERO_SKILL_TAGS = ['English', 'Practical skills', 'Customer understanding'];

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    metric: DashboardMetric.Available,
    label: 'Available profiles',
    hint: 'UC-verified and ready to contact',
    to: RECRUITER_PATH.profiles,
  },
  {
    metric: DashboardMetric.Awaiting,
    label: 'Awaiting placement',
    hint: 'Locked for you, placement not saved yet',
    to: RECRUITER_PATH.myCandidates,
  },
  {
    metric: DashboardMetric.Placed,
    label: 'Placed',
    hint: 'Your confirmed placements',
    to: RECRUITER_PATH.myCandidates,
  },
];

export const DASHBOARD_PREVIEW_COUNT = 3;

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { title: 'Open a verified profile', description: 'The phone numbers appear immediately and the profile is locked for you.' },
  { title: 'Contact and confirm', description: 'Agree the start date and the employer with the partner.' },
  { title: 'Save the placement', description: 'Enter the employer name and start date before the lock expires.' },
];

export const PROFILE_SORT_OPTIONS = [
  { value: ProfileSort.Verified, label: 'Recently verified' },
  { value: ProfileSort.Name, label: 'Name A–Z' },
];

export const PROFILE_SORTERS: Record<ProfileSort, ProfileComparator> = {
  [ProfileSort.Verified]: (a, b) => (b.verifiedAt ?? '').localeCompare(a.verifiedAt ?? '') || a.name.localeCompare(b.name),
  [ProfileSort.Name]: (a, b) => a.name.localeCompare(b.name),
};

export const DEFAULT_PROFILE_FILTERS: ProfileFilters = { search: '', sort: ProfileSort.Verified };

export const CANDIDATE_TABS: CandidateTabConfig[] = [
  { key: CandidateTab.All, label: 'All candidates' },
  { key: CandidateTab.Awaiting, label: 'Awaiting placement', status: ReservationStatus.AwaitingPlacement },
  { key: CandidateTab.Placed, label: 'Placed', status: ReservationStatus.Placed },
];

export const RECRUITER_MESSAGE = {
  reserved: 'Profile locked. Contact details are now available.',
  placementSaved: 'Placement saved successfully.',
  released: 'Lock released. The profile is available to all recruiters again.',
  phoneCopied: 'Phone number copied.',
  phoneCopyFailed: 'Could not copy. Select the number manually.',
};

export const LOCK_NOTE = 'The lock lasts 48 hours. Contacting the partner does not extend it; only a saved placement ends it early.';

export const WHITESPACE = /\s+/g;
