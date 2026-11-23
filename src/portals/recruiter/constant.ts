import { LOCK_DAYS } from '@/domain/constant';
import { ReservationStatus } from '@/domain/interface';
import { NavItem, PortalOption } from '@/shared/components/interface';
import {
  CandidateTab,
  CandidateTabConfig,
  DashboardMetric,
  DashboardStat,
  ProfileComparator,
  ProfileFilters,
  ProfileSort,
  WorkflowStep,
} from './interface';

export const RECRUITER_WORKSPACE = 'Recruiter workspace';

export const RECRUITER_PATH = {
  home: '/recruiter',
  login: '/recruiter/login',
  signUp: '/recruiter/signup',
  dashboard: '/recruiter/dashboard',
  profiles: '/recruiter/profiles',
  myCandidates: '/recruiter/my-candidates',
  registerPartner: '/recruiter/register-partner',
  candidate: (candidateId: string) => `/recruiter/candidates/${candidateId}`,
};

export const RESERVATION_REFETCH_MS = 30_000;

export const RECRUITER_NAV_ITEMS: NavItem[] = [
  { path: RECRUITER_PATH.dashboard, label: 'Dashboard' },
  { path: RECRUITER_PATH.profiles, label: 'Available profiles' },
  { path: RECRUITER_PATH.myCandidates, label: 'My candidates' },
  { path: RECRUITER_PATH.registerPartner, label: 'Register a partner' },
];

export const RECRUITER_HOME = {
  title: 'Recruiter dashboard',
  subtitle: 'Find UC-verified partners, contact them and record placements. Every account is approved by the Urban Company team.',
};

export const RECRUITER_HOME_OPTIONS: PortalOption[] = [
  {
    title: 'New here?',
    description: 'Create an account with your email and organisation. The Urban Company team reviews every request before you can use the dashboard.',
    action: 'Create an account →',
    to: RECRUITER_PATH.signUp,
    primary: true,
  },
  {
    title: 'Already have an account?',
    description: 'Sign in with your email and password to open your recruiter dashboard.',
    action: 'Sign in',
    to: RECRUITER_PATH.login,
  },
];

export const RECRUITER_LOGIN = {
  title: 'Welcome back',
  subtitle: 'Sign in to your recruitment workspace.',
  signUpPrompt: 'No account yet?',
  signUpLink: 'Create an account',
  accountNote: 'If the Urban Company team created your account, sign in with the temporary password they shared and change it afterwards.',
};

export const RECRUITER_SIGN_UP = {
  title: 'Create a recruiter account',
  subtitle: 'Tell us who you are. The Urban Company team approves every account.',
  submit: 'Request account →',
  mismatch: 'Passwords do not match',
  approvalNote: 'Your request goes to the Urban Company team. You can use the dashboard once they approve it.',
  termsNote: 'By requesting an account you accept the recruiter',
  loginPrompt: 'Already have an account?',
  loginLink: 'Sign in',
};

export const PENDING_APPROVAL = {
  message: 'Your account is waiting for approval by the Urban Company team. You can use the recruiter dashboard once it is approved.',
  signOut: 'Sign out',
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
  { title: 'Contact and confirm', description: 'Agree the start date and the aggregator with the partner.' },
  { title: 'Save the placement', description: 'Choose the aggregator and the start date before the lock expires.' },
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

export const PLACEMENT_FINAL_NOTE = 'The placement is saved and cannot be edited here. Contact the business team to change the aggregator or the start date.';

export const LOCK_NOTE = `The lock lasts ${LOCK_DAYS} days. Contacting the partner does not extend it; only a saved placement ends it early.`;

export const NO_EXPIRY_LOCK = {
  title: 'Locked for your account with no expiry',
  note: 'You registered this partner, so the lock stays with you until you save the placement or release it.',
};

export const PLACEMENT_FORM = {
  aggregatorLabel: 'Aggregator',
  aggregatorHint: 'The aggregator under which the work permit will be processed.',
  aggregatorError: 'Choose the aggregator',
  aggregatorPlaceholder: 'Select an aggregator',
  noAggregators:
    'No aggregators have been added to your account yet. Ask the Urban Company team to add one; you can save the placement after that.',
};

export const REGISTER_PARTNER = {
  title: 'Register a partner',
  subtitle: 'Register a partner on their behalf and book their interview slot.',
  note: 'A partner you register is held for you: once they are UC Verified, they are locked to your account with no expiry.',
  successMessage: 'Partner registered.',
  successTitle: (name: string) => `${name} is registered`,
  successSubtitle:
    'The business team will contact them before the interview. They can sign in with their primary mobile number and last name. Once they are UC Verified they appear in your candidates, locked to you with no expiry.',
  registerAnother: 'Register another partner',
  viewCandidates: 'View my candidates',
};

export const REGISTERED_PARTNERS = {
  title: 'Partners you registered',
  note: 'They are held for you: once UC Verified, each one is locked to your account with no expiry and appears in the table above.',
  empty: 'You have not registered any partners yet.',
  register: 'Register a partner',
};

export const WHITESPACE = /\s+/g;
