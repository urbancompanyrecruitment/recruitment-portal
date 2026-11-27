import { formatDate } from '@/domain/format';
import { PartnerNotificationType, PartnerStage } from '@/domain/interface';
import { PortalOption } from '@/shared/components/interface';
import { NotificationCopy } from './interface';

export const PARTNER_ROUTE = {
  home: '/candidate',
  registration: '/candidate/register',
  login: '/candidate/login',
  status: '/candidate/status',
};

export const PARTNER_HEADER = {
  tagline: 'Candidate registration',
  checkStatus: 'Check my status',
  myStatus: 'My status',
  signOut: 'Sign out',
};

export const PARTNER_HOME = {
  title: 'Find cleaning work in Singapore',
  subtitle: 'Register once, choose your interview slot and follow your progress until you join.',
  register: {
    title: 'New registration',
    description: 'Share your details and choose an interview city and slot. It takes about five minutes.',
    action: 'Register now →',
  },
  login: {
    title: 'Already registered?',
    description: 'Sign in with your primary mobile number and last name to see your interview details and status.',
    action: 'Sign in',
  },
};

export const PARTNER_HOME_OPTIONS: PortalOption[] = [
  { ...PARTNER_HOME.register, to: PARTNER_ROUTE.registration, primary: true },
  { ...PARTNER_HOME.login, to: PARTNER_ROUTE.login },
];

export const REGISTRATION = {
  title: 'Register as a candidate',
  subtitle: 'Complete your details and choose your interview city and slot.',
  successMessage: 'Registration saved.',
};

export const PARTNER_LOGIN = {
  title: 'Check your registration status',
  subtitle: 'Sign in with your primary mobile number and the last name you registered with.',
  phoneLabel: 'Primary mobile number',
  lastNameLabel: 'Last name',
  lastNameError: 'Enter your last name',
  submit: 'Sign in →',
  registerPrompt: 'Not registered yet?',
  registerLink: 'Register as a candidate',
};

export const PARTNER_STATUS = {
  title: 'Your registration',
  subtitle: 'The business team will contact you on your primary mobile number at each step.',
  stages: [
    { title: 'Registered', content: 'Your details and interview slot are saved.' },
    { title: 'Verified', content: 'You passed the assessment.' },
    { title: 'Placed', content: 'A recruiter has confirmed your placement.' },
    { title: 'Joined', content: 'You have started with your employer.' },
  ],
  failedStage: { title: 'Not verified', content: 'You did not pass the assessment.' },
  failedNotice: 'You did not pass the verification, so this application is closed. There are no further steps.',
  hubLabel: 'Hub',
  singaporeMissing: 'Not shared yet. The business team can add it when you have one.',
  noSlot: 'No interview slot was selected. The team will share available dates.',
};

export const PARTNER_RESCHEDULE = {
  action: 'Reschedule interview',
  note: 'Cannot make it, or missed your slot? You can pick a new interview slot until your verification result is in.',
  title: 'Choose a new interview slot',
  submit: 'Confirm new slot',
  success: 'Your interview slot has been changed.',
};

export const PARTNER_NOTIFICATIONS = {
  label: 'Notifications',
  title: 'Notifications',
  empty: 'No notifications yet. We will tell you here when you are verified and when a recruiter confirms your placement.',
};

export const NOTIFICATION_REFETCH_MS = 60_000;

export const NOTIFICATION_COPY: Record<PartnerNotificationType, NotificationCopy> = {
  [PartnerNotificationType.Verified]: {
    title: 'You are verified',
    body: () => 'You passed the assessment. A recruiter will contact you about your placement.',
  },
  [PartnerNotificationType.Placement]: {
    title: 'Your placement is confirmed',
    body: data => `Aggregator: ${data?.aggregatorName ?? 'to be confirmed'}. Joining date: ${formatDate(data?.startDate)}.`,
  },
};

export const THANK_YOU = {
  title: 'Thank you — your registration is complete',
  subtitle: 'The business team will contact you on your primary mobile number with the next steps. Sign in any time with your primary mobile number and last name to check your status.',
  checkStatus: 'Check my status',
  noSlot: 'No interview slot was selected. The team will share available dates when they contact you.',
  registerAnother: 'Register another candidate',
};

export const STAGE_ORDER: PartnerStage[] = [PartnerStage.Registered, PartnerStage.Verified, PartnerStage.Placed, PartnerStage.Joined];

export const FAILED_STAGE_INDEX = 1;
