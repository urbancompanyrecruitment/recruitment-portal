import { FUNNEL_WEEK_DAYS } from '@/domain/constant';
import { ImportRowOutcome, InactiveReason, LockState, ReservationEventType } from '@/domain/interface';
import { NavItem } from '@/shared/components/interface';
import { EventTagStyle, OverviewMetric } from './interface';

export const BUSINESS_BASE_PATH = '/business';

export const BUSINESS_ROUTE = {
  login: 'login',
  overview: 'overview',
  trainers: 'trainers',
  recruiters: 'recruiters',
  placements: 'placements',
};

export const BUSINESS_HOME_PATH = `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.overview}`;

export const BUSINESS_WORKSPACE = 'Business workspace';

export const BUSINESS_NAV_ITEMS: NavItem[] = [
  { path: BUSINESS_HOME_PATH, label: 'Overview' },
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.trainers}`, label: 'Trainers & calendars' },
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.recruiters}`, label: 'Recruiter access' },
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`, label: 'Locks, placements & hubs' },
];

export const BUSINESS_LOGIN = {
  title: 'Business team sign in',
  subtitle: 'Sign in with your Urban Company Google account to track recruitment, publish trainer calendars and manage recruiter access.',
  note: 'Access is granted by the business team through the UC access-control dashboard. Only urbancompany.com and urbanclap.com accounts can sign in.',
};

export const SIDEBAR_FOOTER = {
  note: 'Mock data only — changes are stored in this browser.',
  directoryLabel: '← All portals',
  directoryPath: '/',
};

export const BUSINESS_MESSAGE = {
  trainerCreated: 'Trainer created.',
  slotPublished: 'Slot published to partner registration.',
  slotAvailabilityUpdated: 'Session availability updated.',
  recruiterCreated: 'Approved recruiter created.',
  recruiterAccessUpdated: 'Recruiter access updated.',
  hubSaved: 'Hub and joining date saved to the assigned recruiter profile.',
  quotaSaved: 'Aggregator quota saved.',
  singaporePhoneSaved: 'Singapore number saved.',
  importCompleted: 'Verified list processed.',
  locksDeactivated: 'Lock cleanup finished.',
};

export const EMPTY_VALUE = '—';

export const NOT_SCHEDULED = 'Not scheduled';

export const TIME_FORMAT = 'HH:mm';

export const SLOT_MINUTE_STEP = 15;

export const DEFAULT_SLOT_CAPACITY = 8;

export const TABLE_PAGE_SIZE = 10;

export const FUNNEL_DEFAULT_OFFSET_DAYS = FUNNEL_WEEK_DAYS - 1;

export const FUNNEL_BAR_HEIGHT = 12;

export const SIGNUP_EXPORT_FILE_NAME = 'signed-up-partners.csv';

export const SIGNUP_EXPORT_HEADERS = ['Name', 'Location', 'Primary mobile'];

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
};

export const SINGAPORE_PHONE_NOTE =
  'Adding the first Singapore number creates the lead in provider-onboarding-service (mocked here). Updating an existing number only changes the stored value.';

export const SINGAPORE_PHONE_RULE_MESSAGE = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const LOCK_CLEANUP_NOTE =
  'A lock stops counting as soon as its release time passes; the daily cleanup marks those locks inactive so the history below stays readable.';

export const LOCK_STATE_TAG: Record<LockState, EventTagStyle> = {
  [LockState.Active]: { label: 'Active', color: 'success' },
  [LockState.Inactive]: { label: 'Inactive' },
};

export const INACTIVE_REASON_LABEL: Record<InactiveReason, string> = {
  [InactiveReason.Expired]: 'Release time passed',
  [InactiveReason.Placed]: 'Placement saved',
  [InactiveReason.Released]: 'Released by recruiter',
};

export const OVERVIEW_STATS: OverviewMetric[] = [
  { label: 'Total signups', hint: 'Partners registered for the selected filters', matches: () => true },
  {
    label: 'Singapore number on file',
    hint: 'Lead created in provider-onboarding-service',
    matches: row => Boolean(row.candidate.singaporePhone),
  },
  { label: 'UC Verified', hint: 'Approved through the verified list upload', matches: row => row.candidate.verified },
  {
    label: 'Aggregator assigned',
    hint: 'Recruiter placement saved with an aggregator',
    to: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`,
    matches: row => Boolean(row.reservation?.aggregatorId),
  },
];

export const FUNNEL_STEPS: OverviewMetric[] = [
  { label: 'Signups', matches: () => true },
  { label: 'Singapore number', matches: row => Boolean(row.candidate.singaporePhone) },
  { label: 'UC Verified', matches: row => row.candidate.verified },
  { label: 'Aggregator assigned', matches: row => Boolean(row.reservation?.aggregatorId) },
];

export const RESERVATION_EVENT_TAG: Record<ReservationEventType, EventTagStyle> = {
  [ReservationEventType.Opened]: { label: 'Locked' },
  [ReservationEventType.PlacementSaved]: { label: 'Placement saved', color: 'success' },
  [ReservationEventType.Expired]: { label: 'Released — release time passed', color: 'warning' },
  [ReservationEventType.HubUpdated]: { label: 'Hub updated', color: 'blue' },
};
