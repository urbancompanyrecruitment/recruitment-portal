import { FUNNEL_WEEK_DAYS } from '@/domain/constant';
import { AssessmentStage, InvitationStatus, ReservationEventType, StageResult } from '@/domain/interface';
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
  { path: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`, label: 'Placements & hubs' },
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
};

export const EMPTY_VALUE = '—';

export const NOT_SCHEDULED = 'Not scheduled';

export const TIME_FORMAT = 'HH:mm';

export const SLOT_MINUTE_STEP = 15;

export const DEFAULT_SLOT_CAPACITY = 8;

export const TABLE_PAGE_SIZE = 10;

export const FUNNEL_DEFAULT_OFFSET_DAYS = FUNNEL_WEEK_DAYS - 1;

export const FUNNEL_BAR_HEIGHT = 12;

export const TRACKER_CSV_FILE_NAME = 'business-tracker.csv';

export const TRACKER_CSV_HEADERS = [
  'Name',
  'Phone',
  'Country',
  'Geography',
  'Source',
  'Slot',
  'L1',
  'L2',
  'L3',
  'Verified',
  'Recruiter',
  'Aggregator',
  'Start date',
  'Hub',
];

export const OVERVIEW_STATS: OverviewMetric[] = [
  { label: 'Total signups', hint: 'Partners registered for the selected filters', matches: () => true },
  { label: 'Interviews booked', hint: 'Signups holding an interview slot', matches: row => Boolean(row.candidate.slotId) },
  { label: 'UC Verified', hint: 'Passed L1–L3 and confirmed by a trainer', matches: row => row.candidate.verified },
  {
    label: 'Aggregator assigned',
    hint: 'Recruiter placement saved with an aggregator',
    to: `${BUSINESS_BASE_PATH}/${BUSINESS_ROUTE.placements}`,
    matches: row => Boolean(row.reservation?.aggregatorId),
  },
];

export const FUNNEL_STEPS: OverviewMetric[] = [
  { label: 'Signups', matches: () => true },
  { label: 'L1 passed', matches: row => row.candidate.results[AssessmentStage.L1] === StageResult.Passed },
  { label: 'L2 passed', matches: row => row.candidate.results[AssessmentStage.L2] === StageResult.Passed },
  { label: 'L3 passed', matches: row => row.candidate.results[AssessmentStage.L3] === StageResult.Passed },
  { label: 'UC Verified', matches: row => row.candidate.verified },
  { label: 'Aggregator assigned', matches: row => Boolean(row.reservation?.aggregatorId) },
];

export const INVITATION_TAG_COLOR: Record<InvitationStatus, string | undefined> = {
  [InvitationStatus.Queued]: undefined,
  [InvitationStatus.Sent]: 'blue',
  [InvitationStatus.Completed]: 'success',
};

export const RESERVATION_EVENT_TAG: Record<ReservationEventType, EventTagStyle> = {
  [ReservationEventType.Opened]: { label: 'Opened' },
  [ReservationEventType.PlacementSaved]: { label: 'Placement saved', color: 'success' },
  [ReservationEventType.Expired]: { label: 'Released — not assigned in time', color: 'warning' },
  [ReservationEventType.HubUpdated]: { label: 'Hub updated', color: 'blue' },
};
