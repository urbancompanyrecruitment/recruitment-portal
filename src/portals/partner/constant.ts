import { PASSWORD_MIN_LENGTH } from '@/domain/constant';

export const PARTNER_ROUTE = {
  registration: '/partner',
  login: '/partner/login',
  status: '/partner/status',
};

export const PARTNER_HEADER = {
  tagline: 'Urban Company partner registration',
  checkStatus: 'Check my status',
  signOut: 'Sign out',
};

export const REGISTRATION_SUCCESS_MESSAGE = 'Registration saved.';

export const CONSENT_TEXT =
  'I consent to Urban Company collecting my details and registering me as an Urban Company partner.';

export const CONSENT_PENDING_NOTE = 'Final consent wording requires legal approval.';

export const SLOT_DAY_FORMAT = 'ddd, D MMM';

export const PRIMARY_PHONE_HINT = 'Include the country code. The business team will contact you on this number.';

export const PRIMARY_PHONE_ERROR = 'Use + and country code, e.g. +65 9123 4567';

export const SINGAPORE_PHONE_HINT = 'Optional. Needed before Urban Company can onboard you; you can share it later with the team.';

export const SINGAPORE_PHONE_ERROR = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const COPY_PRIMARY_LABEL = 'My primary number is my Singapore number';

export const PASSWORD_HINT = 'You will sign in with your primary mobile number and this password to check your status.';

export const PASSWORD_ERROR = `Use at least ${PASSWORD_MIN_LENGTH} characters`;

export const CONFIRM_PASSWORD_ERROR = 'Passwords do not match';

export const PARTNER_LOGIN = {
  title: 'Check your registration status',
  subtitle: 'Sign in with the primary mobile number and password you chose when you registered.',
  phoneLabel: 'Primary mobile number',
  passwordLabel: 'Password',
  submit: 'Sign in →',
  registerPrompt: 'Not registered yet?',
  registerLink: 'Register as a partner',
  demoNote: 'Sample data: sign in with any registered number, e.g. +65 9000 0001, and the password',
  successMessage: 'Signed in.',
};

export const PARTNER_STATUS = {
  title: 'Your registration',
  subtitle: 'The business team will contact you on your primary mobile number at each step.',
  stages: [
    { title: 'Registered', description: 'Your details and interview slot are saved.' },
    { title: 'UC Verified', description: 'You passed the Urban Company assessment.' },
    { title: 'Placed', description: 'A recruiter has confirmed your placement.' },
  ],
  singaporeMissing: 'Not shared yet. The business team can add it when you have one.',
  noSlot: 'No interview slot was selected. The team will share available dates.',
  onboardingNote: 'Your Singapore number has been shared with Urban Company onboarding.',
};

export const SLOT_NOTICE = 'Your slot is confirmed when you submit. The business team will contact you before the interview.';

export const THANK_YOU = {
  title: 'Thank you — your registration is complete',
  subtitle: 'The business team will contact you on your primary mobile number with the next steps. Sign in any time with your number and password to check your status.',
  checkStatus: 'Check my status',
  onboardingNote: 'Your Singapore number has been shared with Urban Company onboarding.',
  noSlot: 'No interview slot was selected. The team will share available dates when they contact you.',
  registerAnother: 'Register another partner',
};
