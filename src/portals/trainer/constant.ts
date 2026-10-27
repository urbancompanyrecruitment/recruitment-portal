import { hasFailedStage } from '@/domain/assessment';
import { ASSESSMENT_STAGES, ASSIGNABLE_CATEGORIES, STAGE_DESCRIPTION, STAGE_LABEL } from '@/domain/constant';
import { StageResult } from '@/domain/interface';
import { DemoAccount, NavItem } from '@/shared/components/interface';
import { CandidateMilestone, CandidateStatusTab, CandidateStatusTabConfig, ScheduleRange } from './interface';

export const TRAINER_PATH = {
  candidates: '/trainer/candidates',
  schedule: '/trainer/schedule',
  candidate: (candidateId: string) => `/trainer/candidates/${candidateId}`,
};

export const WORKSPACE = 'Trainer workspace';

export const LOGIN_COPY = {
  title: 'Trainer sign in',
  subtitle: 'Review candidates for your geography, record L1–L3 results and confirm UC verification.',
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Sarah Tan · Singapore', loginId: 'trainer.sg' },
  { label: 'Daniel Lim · Singapore', loginId: 'trainer.sg2' },
  { label: 'Su Mon · Myanmar', loginId: 'trainer.mm' },
  { label: 'Priya Shah · Overseas', loginId: 'trainer.overseas' },
];

export const NAV_ITEMS: NavItem[] = [
  { path: TRAINER_PATH.candidates, label: 'Candidates' },
  { path: TRAINER_PATH.schedule, label: 'My schedule' },
];

export const SIDEBAR_FOOTER =
  'You only see candidates for your geography. Every result, note and verification is logged with your name.';

export const CANDIDATE_STATUS_TABS: CandidateStatusTabConfig[] = [
  { value: CandidateStatusTab.All, label: 'All professionals', matches: () => true },
  {
    value: CandidateStatusTab.InProgress,
    label: 'In progress',
    matches: candidate => !candidate.verified && !hasFailedStage(candidate.results),
  },
  { value: CandidateStatusTab.Failed, label: 'Failed', matches: candidate => hasFailedStage(candidate.results) },
  { value: CandidateStatusTab.Verified, label: 'UC Verified', matches: candidate => candidate.verified },
];

export const RESULT_OPTIONS = Object.values(StageResult).map(result => ({ value: result, label: result }));

export const PROGRESS_OPTIONS = [
  ...ASSESSMENT_STAGES.map(stage => ({ value: stage, label: `${STAGE_LABEL[stage]} · ${STAGE_DESCRIPTION[stage]}` })),
  { value: CandidateMilestone.ReadyToVerify, label: 'Ready to verify' },
  { value: CandidateMilestone.Verified, label: 'UC Verified' },
];

export const CATEGORY_OPTIONS = ASSIGNABLE_CATEGORIES.map(category => ({ value: category, label: category }));

export const ATTEMPT_COLOR: Record<StageResult, string> = {
  [StageResult.Passed]: 'green',
  [StageResult.Failed]: 'red',
  [StageResult.Pending]: 'gray',
};

export const L1_TEST_STATUS = {
  completed: 'Completed',
  awaiting: 'Awaiting completion',
};

export const SCHEDULE_RANGE_OPTIONS = [
  { value: ScheduleRange.Upcoming, label: 'Upcoming' },
  { value: ScheduleRange.Past, label: 'Past' },
];

export const CANDIDATE_PAGE_SIZE = 10;

export const NOT_SCHEDULED = 'Not scheduled';

export const UNASSIGNED = 'Unassigned';

export const EMPTY_VALUE = '—';

export const CSV_FILE_NAME = 'trainer-candidates.csv';

export const CSV_HEADERS = [
  'Name',
  'Phone',
  'Country',
  'City',
  'Geography',
  'Interview slot',
  'Assigned trainer',
  'L1',
  'L2',
  'L3',
  'Verified',
  'Category',
  'Notes',
];

export const CSV_NOTE_SEPARATOR = ' | ';

export const YES = 'Yes';

export const NO = 'No';

export const TRAINER_ERROR = {
  outsideGeography: (geography?: string) =>
    `That candidate is outside your geography. You can only review ${geography} candidates.`,
  noteRequired: 'Write a note before adding it.',
};

export const SUCCESS_MESSAGE = {
  resultSaved: 'Assessment result saved.',
  noteAdded: 'Note added.',
  categorySaved: 'Category saved.',
  verified: 'UC Verified. This candidate is now available in the recruiter portal.',
};
