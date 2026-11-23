import { FUNNEL_WEEK_DAYS, LOCK_DAYS, PLACED_STATES } from '@/domain/constant';
import {
  AdminStatus,
  HubRowOutcome,
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
import { SlotImportCounts } from '@/api/interface';
import { HOME_PATH } from '@/shared/auth/constant';
import { NavItem } from '@/shared/components/interface';
import { CsvFileGuide, OverviewMetric, StatusAction } from './interface';

export const ADMIN_BASE_PATH = '/admin';

export const ADMIN_ROUTE = {
  login: 'login',
  overview: 'overview',
  partners: 'partners',
  recruiters: 'recruiters',
  placements: 'placements',
  admins: 'admins',
};

export const ADMIN_HOME_PATH = `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.overview}`;

export const ADMIN_WORKSPACE = 'Admin workspace';

export const ADMIN_PARTNERS_PATH = `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.partners}`;

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: ADMIN_HOME_PATH, label: 'Overview' },
  { path: ADMIN_PARTNERS_PATH, label: 'Partners' },
  { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.recruiters}`, label: 'Recruiter access' },
  { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.placements}`, label: 'Locks & placements' },
];

export const ADMIN_ACCOUNTS_NAV_ITEM: NavItem = { path: `${ADMIN_BASE_PATH}/${ADMIN_ROUTE.admins}`, label: 'Admin accounts' };

export const ADMIN_LOGIN = {
  title: 'Admin sign in',
  subtitle: 'Sign in with the admin account issued to you to track signups, verify partners and manage recruiter access.',
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
  joinedSaved: 'Partner marked as joined.',
  passwordReset: 'Password reset. Share the temporary password with them.',
  aggregatorAdded: 'Aggregator added.',
  aggregatorRemoved: 'Aggregator removed.',
  recruiterTagged: 'Partner tagged to the recruiter.',
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
  note: `The partner is locked for that recruiter for ${LOCK_DAYS} days, as if the recruiter had opened the profile themselves.`,
  recruiterLabel: 'Recruiter',
  recruiterPlaceholder: 'Select an approved recruiter',
  recruiterError: 'Choose a recruiter',
  submit: 'Tag partner',
};

export const REGISTERED_BY_LABEL = 'Registered by';

export const LOCK_ORIGIN_LABEL: Record<LockOrigin, string> = {
  [LockOrigin.Recruiter]: 'Opened by the recruiter',
  [LockOrigin.Registration]: 'Recruiter registered the partner',
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
  empty: 'No recruiters match this search.',
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
  subtitle: 'Create admin sign-ins, reset their passwords and suspend access. Only super admins see this page.',
  createTitle: 'Create admin',
  createNote: 'The new admin signs in with this email and the temporary password shown after creation. Super admins can also manage admin accounts.',
  createAction: 'Create admin',
  listTitle: 'Admins',
  ownAccount: 'You',
  none: 'No admin accounts yet.',
};

export const SELF_SIGN_UP_LABEL = 'Self sign-up';

export const NEVER_SIGNED_IN = 'Never';

export const EMPTY_VALUE = '—';

export const NOT_SCHEDULED = 'Not scheduled';

export const TABLE_PAGE_SIZE = 10;

export const FUNNEL_DEFAULT_OFFSET_DAYS = FUNNEL_WEEK_DAYS - 1;

export const FUNNEL_BAR_HEIGHT = 12;

export const SIGNUP_EXPORT_FILE_NAME = 'signed-up-partners.csv';

export const VERIFIED_CSV_HEADERS: ['primary_mobile', 'verified'] = ['primary_mobile', 'verified'];

export const HUB_CSV_HEADERS: ['primary_mobile', 'hub_name'] = ['primary_mobile', 'hub_name'];

export const OPS_UPLOAD_FILE_NAME = 'ops-lead-upload.csv';

export const OVERVIEW_PAGE = {
  title: 'Admin overview',
  subtitle: 'How the recruitment flow is doing: signups, Singapore numbers, verification, placements and channel conversion.',
  partnersLink: 'Partner list, CSV files and recruiter tagging →',
};

export const PARTNERS_PAGE = {
  title: 'Partners',
  subtitle: 'Download and upload the partner CSV files, add Singapore numbers and tag partners to recruiters.',
  filtersNote: 'The filters apply to the partner list and to both downloads.',
  filesTitle: 'CSV files',
  listTitle: 'Signed-up partners',
  listEmpty: 'No partners match these filters.',
  signedUpSummary: (count: number) => `Partners in this file with the current filters: ${count}`,
  opsUploadSummary: (included: number, total: number) =>
    `Partners in this file with the current filters: ${included} of ${total}`,
};

export const CSV_FILE_CARD = {
  formatLabel: 'Format',
  formatNote: 'CSV file with a header row and these columns:',
  sampleAction: 'Download sample CSV',
  conditionsLabel: 'Conditions',
};

const UPLOAD_CONDITIONS = [
  'primary_mobile is the number the partner signed up with, including the country code.',
  'Each primary_mobile can appear only once in a file.',
  'Values cannot contain a comma. The columns can be in any order.',
  'At most 5,000 rows per file.',
  'Rows that could not be applied are listed after the upload and can be downloaded as a fail CSV.',
];

export const CSV_FILES: Record<'signedUp' | 'opsUpload' | 'verified' | 'hubs', CsvFileGuide> = {
  signedUp: {
    title: 'Download: signed-up partners',
    purpose: 'The partners who signed up, to share for verification.',
    action: 'Download signed-up partners CSV',
    columns: ['name', 'location', 'primary_mobile'],
    conditions: [
      'Includes every partner that matches the filters, whatever their status.',
      'location is the home city and country the partner gave at sign-up.',
      'primary_mobile includes the country code, for example +6591234567.',
    ],
  },
  opsUpload: {
    title: 'Download: ops dashboard lead upload',
    purpose: 'Upload this file on the ops dashboard to create the Urban Company leads:',
    link: { label: 'ops.urbanclap.com/lead/bulkAdd', href: 'https://ops.urbanclap.com/lead/bulkAdd' },
    action: 'Download ops upload CSV',
    columns: ['name', 'phone', 'city_key', 'category_key', 'source_type', 'experiment_name'],
    conditions: [
      'Only partners with a valid Singapore number are included.',
      'phone is the Singapore number as 8 digits, without +65.',
      'Partners who failed verification are left out.',
      'Follows the filters, like the signed-up partners file.',
      'At most 10,000 rows, the limit of the ops page.',
      'city_key, category_key, source_type and experiment_name are fixed values, the same on every row.',
      'Partners downloaded before stay in the file. The ops dashboard keeps one lead per phone number, so uploading them again creates no second lead.',
    ],
  },
  verified: {
    title: 'Upload: verified partners',
    purpose: 'Marks partners as UC Verified or as verification failed.',
    action: 'Upload verified partners CSV',
    columns: VERIFIED_CSV_HEADERS,
    sample: {
      fileName: 'sample-verified-partners.csv',
      rows: [
        ['+6591234567', 'true'],
        ['+959876543210', 'false'],
      ],
    },
    conditions: [
      'verified is true or false. yes / no, 1 / 0 and pass / fail are read the same way.',
      'true marks the partner UC Verified. false marks them as verification failed, which is final.',
      'Only partners who are still Signed up are changed. Rows for partners already verified or failed are reported and not applied.',
      ...UPLOAD_CONDITIONS,
    ],
  },
  hubs: {
    title: 'Upload: hub names',
    purpose: 'Sets the hub each partner belongs to.',
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
      'Uploading a partner again replaces their hub.',
      'Not applied to partners who failed verification.',
      ...UPLOAD_CONDITIONS,
    ],
  },
};

export const SLOT_CSV_HEADERS: ['centre', 'start_time', 'end_time', 'capacity'] = ['centre', 'start_time', 'end_time', 'capacity'];

export const SLOT_UPLOAD = {
  guide: {
    title: 'Upload: interview slots',
    purpose: 'Adds daily interview slots at the Urban Company interview centres, or changes the seats of a slot that already exists.',
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
      'Each row is one slot that repeats every day at that centre. Partners are offered today and the next two days.',
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
  [ImportRowOutcome.ApprovalFailed]: 'Urban Company onboarding approval failed',
};

export const HUB_OUTCOME_LABEL: Record<HubRowOutcome, string> = {
  [HubRowOutcome.Updated]: 'Hub updated',
  [HubRowOutcome.InvalidPhone]: 'Invalid phone number',
  [HubRowOutcome.MissingHub]: 'Hub name is empty',
  [HubRowOutcome.DuplicateInFile]: 'Duplicate row in file',
  [HubRowOutcome.NotFound]: 'No sign-up with this primary mobile',
  [HubRowOutcome.NotEligible]: 'Partner failed verification',
};

export const SINGAPORE_PHONE_NOTE =
  'Adding the first Singapore number creates the Urban Company onboarding lead. If the partner is already UC Verified, the lead is approved at the same time.';

export const SINGAPORE_PHONE_RULE_MESSAGE = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const SLOT_SCHEDULE_NOTE =
  'Each interview city has daily slots with a fixed start time and capacity. Today and the next two days are offered, future start times only.';

export const LOCK_EXPIRY_NOTE = `A lock lasts ${LOCK_DAYS} days and stops counting as soon as its release time passes. It is marked inactive within a day, so the history stays readable. The lock a recruiter gets on a partner they registered has no expiry.`;

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
  { label: 'Total signups', hint: 'Partners registered for the selected filters', matches: () => true },
  {
    label: 'Singapore number on file',
    hint: 'Urban Company onboarding lead created',
    matches: candidate => candidate.hasSingaporePhone,
  },
  { label: 'UC Verified', hint: 'Marked verified in the verified list upload', matches: candidate => candidate.verified },
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
  { label: 'UC Verified', matches: candidate => candidate.verified },
  { label: 'Placed', matches: candidate => PLACED_STATES.includes(candidate.state) },
];
