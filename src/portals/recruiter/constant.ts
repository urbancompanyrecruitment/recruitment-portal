import { ASSIGNABLE_CATEGORIES } from '@/domain/constant';
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
  notifications: '/recruiter/notifications',
  candidate: (candidateId: string) => `/recruiter/candidates/${candidateId}`,
};

export const RESERVATION_REFETCH_MS = 30_000;

export const RECRUITER_NAV_ITEMS: NavItem[] = [
  { path: RECRUITER_PATH.dashboard, label: 'Dashboard' },
  { path: RECRUITER_PATH.profiles, label: 'Available profiles' },
  { path: RECRUITER_PATH.myCandidates, label: 'My candidates' },
  { path: RECRUITER_PATH.notifications, label: 'Notifications' },
];

export const RECRUITER_DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Recruiter A · Alex Morgan', loginId: 'recruiter.a' },
  { label: 'Recruiter B · Jamie Lee', loginId: 'recruiter.b' },
];

export const RECRUITER_LOGIN = {
  title: 'Welcome back',
  subtitle: 'Sign in to your recruitment workspace. Accounts are issued by the business team.',
  demoHeading: 'Explore with a sample account',
  demoPasswordNote: 'Password for all sample accounts:',
  mockNote: 'Recruiter sign-in is mocked in this build. Credentials for external recruiters will come from the backend.',
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
    hint: 'Assign an approved aggregator',
    to: RECRUITER_PATH.myCandidates,
  },
  {
    metric: DashboardMetric.Assigned,
    label: 'Aggregator assigned',
    hint: 'Your confirmed placements',
    to: RECRUITER_PATH.myCandidates,
  },
  {
    metric: DashboardMetric.JoiningSoon,
    label: 'Joining within 2 weeks',
    hint: 'Review hub instructions',
    to: RECRUITER_PATH.notifications,
  },
];

export const DASHBOARD_PREVIEW_COUNT = 3;

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { title: 'Open a verified profile', description: 'The phone number appears immediately and is reserved for you.' },
  { title: 'Contact and confirm', description: 'Enter the start date and approved aggregator.' },
  { title: 'Review hub instructions', description: 'Share the UC-assigned area with the provider.' },
];

export const PROFILE_SORT_OPTIONS = [
  { value: ProfileSort.Experience, label: 'Most experienced' },
  { value: ProfileSort.Name, label: 'Name A–Z' },
];

export const PROFILE_SORTERS: Record<ProfileSort, ProfileComparator> = {
  [ProfileSort.Experience]: (a, b) => b.yearsOfExperience - a.yearsOfExperience || a.name.localeCompare(b.name),
  [ProfileSort.Name]: (a, b) => a.name.localeCompare(b.name),
};

export const DEFAULT_PROFILE_FILTERS: ProfileFilters = { search: '', sort: ProfileSort.Experience };

export const CATEGORY_OPTIONS = ASSIGNABLE_CATEGORIES.map(category => ({ value: category, label: category }));

export const CANDIDATE_TABS: CandidateTabConfig[] = [
  { key: CandidateTab.All, label: 'All candidates' },
  { key: CandidateTab.Awaiting, label: 'Awaiting aggregator', status: ReservationStatus.AwaitingAggregator },
  { key: CandidateTab.Assigned, label: 'Aggregator assigned', status: ReservationStatus.AggregatorAssigned },
];

export const HUB_STATUS = {
  available: { color: 'success', label: 'Hub instructions available' },
  pending: { color: 'warning', label: 'Hub allocation pending' },
};

export const RECRUITER_MESSAGE = {
  reserved: 'Profile reserved. Contact details are now available.',
  placementSaved: 'Placement saved successfully.',
  sampleReset: 'Sample data restored.',
  phoneCopied: 'Phone number copied.',
  phoneCopyFailed: 'Could not copy. Select the number manually.',
  released: (count: number) => `Released ${count} unassigned reservation(s). They are available to all recruiters again.`,
};

export const WHITESPACE = /\s+/g;
