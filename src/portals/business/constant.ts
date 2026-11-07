import { FUNNEL_WEEK_DAYS, PLACED_STATES } from '@/domain/constant';
import { ImportRowOutcome, InactiveReason, LockState } from '@/domain/interface';
import { NavItem } from '@/shared/components/interface';
import { EventTagStyle, OverviewMetric } from './interface';

export const BUSINESS_BASE_PATH = '/business';

export const BUSINESS_ROUTE = {
  login: 'login',
  overview: 'overview',
  recruiters: 'recruiters',
  placements: 'placements',
};

export const BUSINESS_HOME_PATH = `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.overview}`;

export const BUSINESS_WORKSPACE = 'Business workspace';

export const BUSINESS_NAV_ITEMS: NavItem[] = [
  { path: BUSINESS_HOME_PATH, label: 'Overview' },
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.recruiters}`, label: 'Recruiter access' },
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`, label: 'Locks & placements' },
];

export const BUSINESS_LOGIN = {
  title: 'Business team sign in',
  subtitle: 'Sign in with your Urban Company Google account to track signups, verify partners and manage recruiter access.',
  note: 'Only urbancompany.com and urbanclap.com Google accounts can sign in.',
};

export const SIDEBAR_FOOTER = {
  note: 'Connected to partner-recruitment-service.',
  directoryLabel: '← All portals',
  directoryPath: '/',
};

export const BUSINESS_MESSAGE = {
  recruiterCreated: 'Approved recruiter created. Share the temporary password with them.',
  recruiterAccessUpdated: 'Recruiter access updated.',
  singaporePhoneSaved: 'Singapore number saved.',
  importCompleted: 'Verified list processed.',
  joinedSaved: 'Partner marked as joined.',
  passwordReset: 'Temporary password issued.',
};

export const TEMPORARY_PASSWORD = {
  recruiterTitle: (name: string) => `Temporary password for ${name}`,
  partnerTitle: (name: string) => `Temporary password for ${name}`,
  note: 'Shown once. Share it with the person directly; they should change it after signing in.',
  close: 'Done',
};

export const EMPTY_VALUE = '—';

export const NOT_SCHEDULED = 'Not scheduled';

export const TABLE_PAGE_SIZE = 10;

export const FUNNEL_DEFAULT_OFFSET_DAYS = FUNNEL_WEEK_DAYS - 1;

export const FUNNEL_BAR_HEIGHT = 12;

export const SIGNUP_EXPORT_FILE_NAME = 'signed-up-partners.csv';

export const VERIFIED_CSV_COLUMN = 'primary_mobile';

export const VERIFIED_CSV_NOTE =
  'Upload a CSV with a primary_mobile column (or one number per line). Only partners with a valid Singapore number on file are verified and approved; every other row goes to the fail CSV.';

export const FAIL_CSV_FILE_NAME = 'verification-failures.csv';

export const FAIL_CSV_HEADERS = ['Row', 'Primary mobile', 'Reason'];

export const IMPORT_OUTCOME_LABEL: Record<ImportRowOutcome, string> = {
  [ImportRowOutcome.Accepted]: 'Verified and approved',
  [ImportRowOutcome.InvalidPhone]: 'Invalid phone number',
  [ImportRowOutcome.DuplicateInFile]: 'Duplicate row in file',
  [ImportRowOutcome.NotFound]: 'No sign-up with this primary mobile',
  [ImportRowOutcome.AlreadyVerified]: 'Already verified',
  [ImportRowOutcome.NoSingaporeNumber]: 'No Singapore number on file',
  [ImportRowOutcome.ApprovalFailed]: 'Approval in provider-onboarding-service failed',
};

export const SINGAPORE_PHONE_NOTE =
  'Adding the first Singapore number creates the lead in provider-onboarding-service. Updating an existing number only changes the stored value.';

export const SINGAPORE_PHONE_RULE_MESSAGE = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const SLOT_SCHEDULE_NOTE =
  'Slots are generated, not published: one-hour slots from 08:00 to 18:00 for today and the next two days in each interview city. Only future start times are offered.';

export const LOCK_EXPIRY_NOTE =
  'A lock stops counting as soon as its release time passes; the daily script then marks it inactive so the history stays readable.';

export const LOCK_STATE_TAG: Record<LockState, EventTagStyle> = {
  [LockState.Active]: { label: 'Active', color: 'success' },
  [LockState.Inactive]: { label: 'Inactive' },
};

export const INACTIVE_REASON_LABEL: Record<InactiveReason, string> = {
  [InactiveReason.Expired]: 'Release time passed',
  [InactiveReason.Placed]: 'Placement saved',
  [InactiveReason.Released]: 'Released by recruiter',
};

export const RELEASED_REASONS: InactiveReason[] = [InactiveReason.Expired, InactiveReason.Released];

export const OVERVIEW_STATS: OverviewMetric[] = [
  { label: 'Total signups', hint: 'Partners registered for the selected filters', matches: () => true },
  {
    label: 'Singapore number on file',
    hint: 'Lead created in provider-onboarding-service',
    matches: row => row.candidate.hasSingaporePhone,
  },
  { label: 'UC Verified', hint: 'Approved through the verified list upload', matches: row => row.candidate.verified },
  {
    label: 'Placed',
    hint: 'Recruiter placement saved',
    to: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`,
    matches: row => PLACED_STATES.includes(row.candidate.state),
  },
];

export const FUNNEL_STEPS: OverviewMetric[] = [
  { label: 'Signups', matches: () => true },
  { label: 'Singapore number', matches: row => row.candidate.hasSingaporePhone },
  { label: 'UC Verified', matches: row => row.candidate.verified },
  { label: 'Placed', matches: row => PLACED_STATES.includes(row.candidate.state) },
];
