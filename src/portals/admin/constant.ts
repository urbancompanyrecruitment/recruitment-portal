import { FUNNEL_WEEK_DAYS, LOCK_DAYS, PLACED_STATES, RECRUITER_STATUS_TAG } from '@/domain/constant';
import {
  AdminStatus,
  HubRowOutcome,
  LabelledOption,
  InterviewCentre,
  ImportRowOutcome,
  InactiveReason,
  LockOrigin,
  LockState,
  PartnerState,
  RecruiterStatus,
  SlotRowOutcome,
  TagStyle,
} from '@/domain/interface';
import { SingaporePhoneFilter, SlotImportCounts } from '@/api/interface';
import { HOME_PATH } from '@/shared/auth/constant';
import { NavItem } from '@/shared/components/interface';
import { AdminTool, AdminToolConfig, AdminToolGroup, CsvFileGuide, OverviewMetric, StatusAction } from './interface';

export const ADMIN_BASE_PATH = '/admin';

export const ADMIN_ROUTE = {
  login: 'login',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  overview: 'overview',
  partners: 'candidates',
  recruiters: 'recruiters',
  placements: 'placements',
  admins: 'admins',
};

export const ADMIN_HOME_PATH = `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.overview}`;

export const ADMIN_WORKSPACE = 'Admin workspace';

export const ADMIN_PARTNERS_PATH = `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.partners}`;

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: ADMIN_HOME_PATH, label: 'Overview' },
  { path: ADMIN_PARTNERS_PATH, label: 'Candidates' },
  { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.recruiters}`, label: 'Recruiter access' },
  { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.placements}`, label: 'Locks & placements' },
];

export const ADMIN_ACCOUNTS_NAV_ITEM: NavItem = { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.admins}`, label: 'Admin accounts' };

export const ADMIN_LOGIN = {
  title: 'Admin sign in',
  subtitle: 'Sign in with the admin account issued to you to track signups, verify candidates and manage recruiter access.',
  note: 'Admin accounts are created by a super admin. Ask one of them for access or a password reset.',
  emailError: 'Enter your email',
  passwordError: 'Enter your password',
  submit: 'Sign in →',
};

export const SIDEBAR_FOOTER = {
  directoryLabel: '← Home',
  directoryPath: HOME_PATH,
};

export const ADMIN_MESSAGE = {
  recruiterCreated: 'Approved recruiter created. Share the temporary password with them.',
  recruiterAccessUpdated: 'Recruiter access updated.',
  adminCreated: 'Admin account created. Share the temporary password with them.',
  adminAccessUpdated: 'Admin access updated.',
  singaporePhoneSaved: 'Singapore number saved.',
  importCompleted: 'Verified list processed.',
  hubImportCompleted: 'Hub list processed.',
  slotImportCompleted: 'Slot list processed.',
  joinedSaved: 'Candidate marked as joined.',
  passwordReset: 'Password reset. Share the temporary password with them.',
  aggregatorAdded: 'Aggregator added.',
  aggregatorRemoved: 'Aggregator removed.',
  recruiterTagged: 'Candidate tagged to the recruiter.',
};

export const AGGREGATORS = {
  column: 'Aggregators',
  none: 'None yet',
  manage: 'Aggregators',
  modalTitle: (name: string) => `Aggregators for ${name}`,
  note: 'The recruiter chooses one of these aggregators when saving a placement. A recruiter without aggregators cannot save a placement.',
  empty: 'No aggregators have been added for this recruiter yet.',
  nameLabel: 'Aggregator name',
  namePlaceholder: 'e.g. CleanSpace Services',
  nameError: 'Enter the aggregator name',
  add: 'Add aggregator',
  remove: 'Remove',
  removeTitle: (name: string) => `Remove ${name}?`,
  removeNote: 'The recruiter can no longer choose it. Placements already saved keep the name.',
  close: 'Done',
};

export const TAG_RECRUITER = {
  action: 'Tag to recruiter',
  title: (name: string) => `Tag ${name} to a recruiter`,
  note: `The candidate is locked for that recruiter for ${LOCK_DAYS} days, as if the recruiter had opened the profile themselves.`,
  recruiterLabel: 'Recruiter',
  recruiterPlaceholder: 'Select an approved recruiter',
  recruiterError: 'Choose a recruiter',
  submit: 'Tag candidate',
};

export const REGISTERED_BY_LABEL = 'Registered by';

export const LOCK_ORIGIN_LABEL: Record<LockOrigin, string> = {
  [LockOrigin.Recruiter]: 'Opened by the recruiter',
  [LockOrigin.Registration]: 'Recruiter registered the candidate',
  [LockOrigin.Admin]: 'Tagged by an admin',
};

export const TEMPORARY_PASSWORD = {
  title: (name: string) => `Temporary password for ${name}`,
  accountLabel: 'Signs in with',
  passwordLabel: 'Temporary password',
  note: 'Shown once. Share it with the person directly; they should change it after signing in.',
  close: 'Done',
};

export const RESET_PASSWORD = {
  action: 'Reset password',
  confirmTitle: (name: string) => `Reset the password for ${name}?`,
  confirmNote: 'Their current password stops working. You get a temporary password to share with them.',
};

export const RECRUITER_SEARCH = {
  placeholder: 'Search by name, organisation or email',
  label: 'Search recruiters',
  empty: 'No recruiters match this search or filter.',
  none: 'No recruiters yet.',
};

export const APPROVAL_REQUESTS = {
  title: 'Approval requests',
  note: 'Recruiters who created their own account. They can sign in but cannot use any recruiter feature until you approve them.',
  none: 'No requests are waiting for approval.',
  approve: 'Approve',
  reject: 'Reject',
  rejectTitle: (name: string) => `Reject the request from ${name}?`,
  rejectNote: 'They will not be able to sign in. You can still approve them later from the recruiters table.',
};

export const RECRUITER_STATUS_ACTION: Partial<Record<RecruiterStatus, StatusAction<RecruiterStatus>>> = {
  [RecruiterStatus.Active]: { label: 'Suspend', next: RecruiterStatus.Suspended, danger: true },
  [RecruiterStatus.Suspended]: { label: 'Reactivate', next: RecruiterStatus.Active },
  [RecruiterStatus.Rejected]: { label: 'Approve', next: RecruiterStatus.Active },
};

export const ADMIN_STATUS_ACTION: Record<AdminStatus, StatusAction<AdminStatus>> = {
  [AdminStatus.Active]: { label: 'Suspend', next: AdminStatus.Suspended, danger: true },
  [AdminStatus.Suspended]: { label: 'Reactivate', next: AdminStatus.Active },
};

export const ADMIN_STATUS_TAG: Record<AdminStatus, TagStyle> = {
  [AdminStatus.Active]: { label: 'Active', color: 'success' },
  [AdminStatus.Suspended]: { label: 'Suspended', color: 'error' },
};

export const ADMIN_ACCOUNTS = {
  title: 'Admin accounts',
  subtitle: 'Reset admin passwords and suspend or bring back access. Create an admin from the sidebar. Only super admins see this page.',
  createTitle: 'Create admin',
  createNote: 'The new admin signs in with this email and the temporary password shown after creation. Super admins can also manage admin accounts.',
  createAction: 'Create admin',
  listTitle: 'Admins',
  ownAccount: 'You',
  none: 'No admin accounts yet.',
  searchPlaceholder: 'Search by name, email or role',
  searchLabel: 'Search admins',
  searchEmpty: 'No admins match this search or these filters.',
};

export const SELF_SIGN_UP_LABEL = 'Self sign-up';

export const LAST_SIGN_IN = {
  at: (dateTime: string) => `Last sign-in ${dateTime}`,
  never: 'Never signed in',
};

export const EMPTY_VALUE = '—';

export const NOT_SCHEDULED = 'Not scheduled';

export const FUNNEL_DEFAULT_OFFSET_DAYS = FUNNEL_WEEK_DAYS - 1;

export const FUNNEL_BAR_HEIGHT = 12;

export const SIGNUP_EXPORT_FILE_NAME = 'signed-up-candidates.csv';

export const VERIFIED_CSV_HEADERS: ['primary_mobile', 'verified'] = ['primary_mobile', 'verified'];

export const HUB_CSV_HEADERS: ['primary_mobile', 'hub_name'] = ['primary_mobile', 'hub_name'];

export const OPS_UPLOAD_FILE_NAME = 'ops-lead-upload.csv';

export const OVERVIEW_PAGE = {
  title: 'Admin overview',
  subtitle: 'How the recruitment flow is doing: signups, Singapore numbers, verification, placements and channel conversion.',
  partnersLink: 'Candidate list and recruiter tagging →',
};

/** Keeps "Registered by <recruiter> · <company>" to two lines in the candidates list. */
export const CANDIDATE_COLUMN_WIDTH = 210;

export const PARTNERS_PAGE = {
  title: 'Candidates',
  subtitle: 'Find a candidate, add their Singapore number, tag them to a recruiter or mark them joined. CSV downloads and uploads are in the sidebar.',
  listTitle: 'Signed-up candidates',
  listEmpty: 'No candidates match these filters.',
  searchPlaceholder: 'Search by name, mobile, hub or recruiter',
  searchLabel: 'Search candidates',
  phonesColumn: 'Mobile numbers',
  singaporePhonePrefix: 'Singapore:',
};

export const DOWNLOAD_PAGE = {
  filtersNote: 'The filters decide which candidates go into the file.',
  summary: (included: number, total: number, isOpsUpload: boolean) =>
    isOpsUpload
      ? `Candidates in this file with the current filters: ${included} of ${total}`
      : `Candidates in this file with the current filters: ${included}`,
};

export const UPLOAD_RESULT = {
  verifiedTitle: (fileName: string) => `Verified list: ${fileName}`,
  verifiedSummary: ({ accepted, rejected, errors, rows }: { accepted: number; rejected: number; errors: number; rows: number }) =>
    `${accepted} verified, ${rejected} marked as verification failed, ${errors} not applied out of ${rows} rows.`,
  failCsvAction: 'Download fail CSV',
  hubTitle: (fileName: string) => `Hub list: ${fileName}`,
  hubSummary: ({ updated, errors, rows }: { updated: number; errors: number; rows: number }) =>
    `${updated} ${updated === 1 ? 'hub' : 'hubs'} updated, ${errors} not applied out of ${rows} rows.`,
  hubFailCsvAction: 'Download hub fail CSV',
};

export const CREATE_RECRUITER = {
  cardTitle: 'Create recruiter',
  note: 'An account you create here is approved straight away. The recruiter signs in with this email and the temporary password shown after creation.',
  submit: 'Create approved recruiter',
};

export const ACCESS_LOG = {
  title: 'Profile access log',
  empty: 'No recruiter has opened a profile yet.',
  searchPlaceholder: 'Search by candidate, recruiter or aggregator',
  searchLabel: 'Search the access log',
  searchEmpty: 'No entries match this search or these filters.',
};

export const PLACEMENTS_PAGE = {
  title: 'Locks & placements',
  subtitle: 'See which recruiter holds each candidate and the placements they saved.',
  searchPlaceholder: 'Search by candidate, recruiter, organisation or aggregator',
  searchLabel: 'Search locks and placements',
  searchNote: 'The search and the filters apply to both lists below.',
  locksTitle: 'Recruiter locks',
  locksEmpty: 'No candidate has been locked yet.',
  releasedTitle: 'Released profiles',
  releasedEmpty: 'No profiles have been released.',
  searchEmpty: 'No entries match this search or these filters.',
};

export const CSV_FILE_CARD = {
  title: 'About this file',
  formatLabel: 'Format',
  formatNote: 'CSV file with a header row and these columns:',
  sampleAction: 'Download sample CSV',
  conditionsLabel: 'Conditions',
};

const UPLOAD_CONDITIONS = [
  'primary_mobile is the number the candidate signed up with, including the country code.',
  'Each primary_mobile can appear only once in a file.',
  'Values cannot contain a comma. The columns can be in any order.',
  'At most 5,000 rows per file.',
  'Rows that could not be applied are listed after the upload and can be downloaded as a fail CSV.',
];

export const CSV_FILES: Record<'signedUp' | 'opsUpload' | 'verified' | 'hubs', CsvFileGuide> = {
  signedUp: {
    title: 'Download: signed-up candidates',
    purpose: 'The candidates who signed up, to share for verification.',
    action: 'Download signed-up candidates CSV',
    columns: ['name', 'location', 'primary_mobile'],
    conditions: [
      'Includes every candidate that matches the filters, whatever their status.',
      'location is the home city and country the candidate gave at sign-up.',
      'primary_mobile includes the country code, for example +6591234567.',
    ],
  },
  opsUpload: {
    title: 'Download: ops dashboard lead upload',
    purpose: 'Upload this file on the ops dashboard lead bulk upload page to create the leads.',
    action: 'Download ops upload CSV',
    columns: ['name', 'phone', 'city_key', 'category_key', 'source_type', 'experiment_name'],
    conditions: [
      'Only candidates with a valid Singapore number are included.',
      'phone is the Singapore number as 8 digits, without +65.',
      'Candidates who failed verification are left out.',
      'Follows the filters, like the signed-up candidates file.',
      'At most 10,000 rows, the limit of the ops page.',
      'city_key, category_key, source_type and experiment_name are fixed values, the same on every row.',
      'Candidates downloaded before stay in the file. The ops dashboard keeps one lead per phone number, so uploading them again creates no second lead.',
    ],
  },
  verified: {
    title: 'Upload: verified candidates',
    purpose: 'Marks candidates as verified or as verification failed.',
    action: 'Upload verified candidates CSV',
    columns: VERIFIED_CSV_HEADERS,
    sample: {
      fileName: 'sample-verified-candidates.csv',
      rows: [
        ['+6591234567', 'true'],
        ['+959876543210', 'false'],
      ],
    },
    conditions: [
      'verified is true or false. yes / no, 1 / 0 and pass / fail are read the same way.',
      'true marks the candidate verified. false marks them as verification failed, which is final.',
      'Only candidates who are still Signed up are changed. Rows for candidates already verified or failed are reported and not applied.',
      ...UPLOAD_CONDITIONS,
    ],
  },
  hubs: {
    title: 'Upload: hub names',
    purpose: 'Sets the hub each candidate belongs to.',
    action: 'Upload hub names CSV',
    columns: HUB_CSV_HEADERS,
    sample: {
      fileName: 'sample-hub-names.csv',
      rows: [
        ['+6591234567', 'Jurong West'],
        ['+959876543210', 'Yangon Central'],
      ],
    },
    conditions: [
      'hub_name cannot be empty and is at most 120 characters.',
      'Uploading a candidate again replaces their hub.',
      'Not applied to candidates who failed verification.',
      ...UPLOAD_CONDITIONS,
    ],
  },
};

export const SLOT_CSV_HEADERS: ['centre', 'start_time', 'end_time', 'capacity'] = ['centre', 'start_time', 'end_time', 'capacity'];

export const SLOT_UPLOAD = {
  guide: {
    title: 'Upload: interview slots',
    purpose: 'Adds daily interview slots at the interview centres, or changes the seats of a slot that already exists.',
    action: 'Upload interview slots CSV',
    columns: SLOT_CSV_HEADERS,
    sample: {
      fileName: 'sample-interview-slots.csv',
      rows: [
        ['singapore', '09:00', '10:00', '4'],
        ['singapore', '14:30', '15:30', '6'],
        ['yangon', '10:00', '11:00', '4'],
      ],
    },
    conditions: [
      'Each row is one slot that repeats every day at that centre. Candidates are offered today and the next two days.',
      'Enter start_time and end_time in the local time of that centre, not in your own time zone: Singapore time for singapore, Myanmar time for yangon.',
      'Both times are in 24-hour form, for example 09:00 or 14:30, and end_time must be later than start_time.',
      'capacity is the number of seats, from 1 to 200.',
      'A row for a centre and start time that already exists replaces its end time and capacity and switches the slot on again.',
      'A row with a centre that is not listed below is not created. Rows that were not applied are listed after the upload.',
      'At most 200 rows per file. Each centre and start time can appear only once in a file.',
    ],
  },
  centreCondition: (centre: InterviewCentre) =>
    `centre "${centre.key}" is the ${centre.name}: ${centre.address}. Its local time zone is ${centre.timeZone}.`,
  resultTitle: (fileName: string) => `Slot list: ${fileName}`,
  resultSummary: ({ created, updated, errors, rows }: SlotImportCounts) =>
    `${created} created, ${updated} updated, ${errors} not applied out of ${rows} ${rows === 1 ? 'row' : 'rows'}.`,
  failCsvAction: 'Download slot fail CSV',
};

export const SLOT_OUTCOME_LABEL: Record<SlotRowOutcome, string> = {
  [SlotRowOutcome.Created]: 'Slot created',
  [SlotRowOutcome.Updated]: 'Slot updated',
  [SlotRowOutcome.UnknownCentre]: 'Not a valid interview centre',
  [SlotRowOutcome.InvalidTime]: 'start_time must be a 24-hour time such as 09:00',
  [SlotRowOutcome.InvalidEndTime]: 'end_time must be a 24-hour time later than start_time',
  [SlotRowOutcome.InvalidCapacity]: 'capacity must be a whole number from 1 to 200',
  [SlotRowOutcome.DuplicateInFile]: 'Duplicate row in file',
};

export const SLOT_FAIL_CSV_FILE_NAME = 'slot-upload-failures.csv';

export const SLOT_FAIL_CSV_HEADERS = ['Row', 'Centre', 'Start time', 'End time', 'Capacity', 'Reason'];

export const FAIL_CSV_FILE_NAME = 'verification-failures.csv';

export const FAIL_CSV_HEADERS = ['Row', 'Primary mobile', 'Verified', 'Reason'];

export const HUB_FAIL_CSV_FILE_NAME = 'hub-upload-failures.csv';

export const HUB_FAIL_CSV_HEADERS = ['Row', 'Primary mobile', 'Hub name', 'Reason'];

export const PROCESSED_IMPORT_OUTCOMES: ImportRowOutcome[] = [ImportRowOutcome.Accepted, ImportRowOutcome.Rejected];

export const IMPORT_OUTCOME_LABEL: Record<ImportRowOutcome, string> = {
  [ImportRowOutcome.Accepted]: 'Marked as verified',
  [ImportRowOutcome.Rejected]: 'Marked as verification failed',
  [ImportRowOutcome.InvalidPhone]: 'Invalid phone number',
  [ImportRowOutcome.InvalidVerified]: 'The verified column must be true or false',
  [ImportRowOutcome.DuplicateInFile]: 'Duplicate row in file',
  [ImportRowOutcome.NotFound]: 'No sign-up with this primary mobile',
  [ImportRowOutcome.AlreadyVerified]: 'Already verified',
  [ImportRowOutcome.AlreadyFailed]: 'Already marked as verification failed',
  [ImportRowOutcome.NoSingaporeNumber]: 'No Singapore number on file',
  [ImportRowOutcome.ApprovalFailed]: 'Lead approval failed',
};

export const HUB_OUTCOME_LABEL: Record<HubRowOutcome, string> = {
  [HubRowOutcome.Updated]: 'Hub updated',
  [HubRowOutcome.InvalidPhone]: 'Invalid phone number',
  [HubRowOutcome.MissingHub]: 'Hub name is empty',
  [HubRowOutcome.DuplicateInFile]: 'Duplicate row in file',
  [HubRowOutcome.NotFound]: 'No sign-up with this primary mobile',
  [HubRowOutcome.NotEligible]: 'Candidate failed verification',
};

export const SINGAPORE_PHONE_NOTE =
  'The Singapore number is the one the candidate will work with. Candidates with a Singapore number are included in the ops upload file.';

export const SINGAPORE_PHONE_RULE_MESSAGE = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const SLOT_SCHEDULE_NOTE =
  'Each interview city has daily slots with a fixed start time and capacity. Today and the next two days are offered, future start times only.';

export const LOCK_EXPIRY_NOTE = `A lock lasts ${LOCK_DAYS} days and stops counting as soon as its release time passes. It is marked inactive within a day, so the history stays readable. The lock a recruiter gets on a candidate they registered has no expiry.`;

export const LOCK_STATE_TAG: Record<LockState, TagStyle> = {
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
  { label: 'Total signups', hint: 'Candidates registered for the selected filters', matches: () => true },
  {
    label: 'Singapore number on file',
    hint: 'Included in the ops upload file',
    matches: candidate => candidate.hasSingaporePhone,
  },
  { label: 'Verified', hint: 'Marked verified in the verified list upload', matches: candidate => candidate.verified },
  {
    label: 'Verification failed',
    hint: 'Marked failed in the verified list upload',
    matches: candidate => candidate.state === PartnerState.VerificationFailed,
  },
  {
    label: 'Placed',
    hint: 'Recruiter placement saved',
    to: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.placements}`,
    matches: candidate => PLACED_STATES.includes(candidate.state),
  },
];

export const FUNNEL_STEPS: OverviewMetric[] = [
  { label: 'Signups', matches: () => true },
  { label: 'Singapore number', matches: candidate => candidate.hasSingaporePhone },
  { label: 'Verified', matches: candidate => candidate.verified },
  { label: 'Placed', matches: candidate => PLACED_STATES.includes(candidate.state) },
];

export const ADMIN_TOOL_ROUTE = (tool: AdminTool): string => `tools/${tool}`;

export const adminToolPath = (tool: AdminTool): string => `${ADMIN_BASE_PATH}/${ADMIN_TOOL_ROUTE(tool)}`;

export const ADMIN_TOOLS: Record<AdminTool, AdminToolConfig> = {
  [AdminTool.SignedUpDownload]: { label: 'Signed-up candidates', title: CSV_FILES.signedUp.title, subtitle: CSV_FILES.signedUp.purpose },
  [AdminTool.OpsUploadDownload]: { label: 'Ops lead upload file', title: CSV_FILES.opsUpload.title, subtitle: CSV_FILES.opsUpload.purpose },
  [AdminTool.VerifiedUpload]: { label: 'Verified candidates', title: CSV_FILES.verified.title, subtitle: CSV_FILES.verified.purpose },
  [AdminTool.HubUpload]: { label: 'Hub names', title: CSV_FILES.hubs.title, subtitle: CSV_FILES.hubs.purpose },
  [AdminTool.SlotUpload]: { label: 'Interview slots', title: SLOT_UPLOAD.guide.title, subtitle: SLOT_UPLOAD.guide.purpose },
  [AdminTool.CreateRecruiter]: {
    label: 'Create recruiter',
    title: 'Create recruiter',
    subtitle: 'Create an approved recruiter account and share the temporary password with them.',
  },
  [AdminTool.CreateAdmin]: {
    label: 'Create admin',
    title: 'Create admin',
    subtitle: 'Create an admin sign-in and share the temporary password with them.',
    superAdminOnly: true,
  },
};

export const ADMIN_TOOL_GROUPS: AdminToolGroup[] = [
  { title: 'Download CSV', tools: [AdminTool.SignedUpDownload, AdminTool.OpsUploadDownload] },
  { title: 'Upload CSV', tools: [AdminTool.VerifiedUpload, AdminTool.HubUpload, AdminTool.SlotUpload] },
  { title: 'Accounts', tools: [AdminTool.CreateRecruiter, AdminTool.CreateAdmin] },
];

export const SINGAPORE_PHONE_FILTER_OPTIONS: LabelledOption<SingaporePhoneFilter>[] = [
  { value: 'true', label: 'Has a Singapore number' },
  { value: 'false', label: 'No Singapore number' },
];

export const LIST_FILTER = {
  recruiterLabel: 'Filter by recruiter',
  recruiterPlaceholder: 'All recruiters',
  lockStateLabel: 'Filter by lock state',
  lockStatePlaceholder: 'Active and inactive',
  originLabel: 'Filter by how the lock was made',
  originPlaceholder: 'Every way of locking',
  recruiterStatusLabel: 'Filter by account status',
  recruiterStatusPlaceholder: 'All statuses',
  adminRoleLabel: 'Filter by role',
  adminRolePlaceholder: 'All roles',
  adminStatusLabel: 'Filter by status',
  adminStatusPlaceholder: 'All statuses',
};

export const LOCK_STATE_FILTER_OPTIONS: LabelledOption<LockState>[] = Object.values(LockState).map(value => ({
  value,
  label: LOCK_STATE_TAG[value].label,
}));

export const LOCK_ORIGIN_FILTER_OPTIONS: LabelledOption<LockOrigin>[] = Object.values(LockOrigin).map(value => ({
  value,
  label: LOCK_ORIGIN_LABEL[value],
}));

export const RECRUITER_STATUS_FILTER_OPTIONS: LabelledOption<RecruiterStatus>[] = [
  RecruiterStatus.Active,
  RecruiterStatus.Suspended,
  RecruiterStatus.Rejected,
].map(value => ({ value, label: RECRUITER_STATUS_TAG[value].label }));

export const ADMIN_STATUS_FILTER_OPTIONS: LabelledOption<AdminStatus>[] = Object.values(AdminStatus).map(value => ({
  value,
  label: ADMIN_STATUS_TAG[value].label,
}));
