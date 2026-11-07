import { UserRole } from '@/domain/interface';

export const QUERY_KEY = {
  candidates: ['candidates'],
  interviewCities: ['interview-cities'],
  bookableSlots: (cityKey: string) => ['slots', 'bookable', cityKey],
  upcomingSlotDays: ['slots', 'upcoming-days'],
  recruiters: ['recruiters'],
  reservations: ['reservations'],
  availableCandidates: ['available-candidates'],
  myReservations: (recruiterId: string) => ['my-reservations', recruiterId],
  candidateProfile: (candidateId: string, recruiterId: string) => ['candidate-profile', candidateId, recruiterId],
  partnerStatus: (candidateId: string) => ['partner-status', candidateId],
  currentUser: (role: UserRole) => ['current-user', role],
} as const;

export const HTTP_UNAUTHORIZED = 401;

export const HTTP_NO_CONTENT = 204;

export const ROLE_API_SEGMENT: Record<UserRole, string> = {
  [UserRole.Partner]: 'partner',
  [UserRole.Recruiter]: 'recruiter',
  [UserRole.Business]: 'admin',
};

export const API_PATH = {
  interviewCities: '/partner/interview-cities',
  interviewSlots: (cityKey: string) => `/partner/interview-slots?cityKey=${encodeURIComponent(cityKey)}`,
  signUp: '/partner/sign-up',
  partnerStatus: '/partner/me',
  login: (role: UserRole) => `/${ROLE_API_SEGMENT[role]}/auth/login`,
  googleLogin: '/admin/auth/google',
  logout: (role: UserRole) => `/${ROLE_API_SEGMENT[role]}/auth/logout`,
  me: (role: UserRole) => `/${ROLE_API_SEGMENT[role]}/auth/me`,
  adminPartners: '/admin/partners',
  adminPartnersExport: '/admin/partners/export.csv',
  singaporePhone: (candidateId: string) => `/admin/partners/${candidateId}/singapore-phone`,
  resetPassword: (candidateId: string) => `/admin/partners/${candidateId}/reset-password`,
  markJoined: (candidateId: string) => `/admin/partners/${candidateId}/mark-joined`,
  verificationImports: '/admin/verification-imports',
  slotOccupancy: '/admin/slot-occupancy',
  adminRecruiters: '/admin/recruiters',
  recruiterStatus: (recruiterId: string) => `/admin/recruiters/${recruiterId}/status`,
  adminLocks: '/admin/locks',
  availablePartners: '/recruiter/partners/available',
  myLocks: '/recruiter/locks',
  lockPartner: (candidateId: string) => `/recruiter/partners/${candidateId}/lock`,
  lockedPartner: (candidateId: string) => `/recruiter/partners/${candidateId}`,
  placement: (candidateId: string) => `/recruiter/partners/${candidateId}/placement`,
  release: (candidateId: string) => `/recruiter/partners/${candidateId}/release`,
};

export const API_ERROR = {
  candidateNotFound: 'Candidate not found.',
  reservationNotFound: 'This profile is not locked by you. It may have expired.',
  lockExpired: 'Your lock on this profile has expired. It is back in the pool.',
  duplicatePhone: 'This primary mobile number is already registered. If it is yours, sign in with your password.',
  invalidPartnerCredentials: 'Check your primary mobile number and password.',
  loginLocked: 'Too many failed attempts. Try again in 15 minutes.',
  invalidSingaporePhone: 'Enter a valid Singapore mobile number (+65 8xxx xxxx or 9xxx xxxx).',
  invalidPhone: 'Enter a mobile number with the country code.',
  unknownCity: 'Choose one of the listed interview cities.',
  slotUnavailable: 'That slot is in the past, full or not offered. Choose another slot.',
  referrerRequired: 'Add the recruiter, referrer or aggregator name.',
  profileUnavailable: 'This profile is unavailable.',
  reservedByOther: 'This profile is locked by another recruiter.',
  invalidPlacement: 'Choose a joining date from today onwards.',
  duplicateLogin: 'A recruiter with this email already exists.',
  invalidCredentials: 'Check your email and password.',
  recruiterSuspended: 'This recruiter account is suspended.',
  forbidden: 'Only Urban Company accounts can sign in here.',
  invalidTransition: 'This change is not allowed in the partner’s current state.',
  busy: 'The system is busy. Try again in a moment.',
  sessionExpired: 'Your session has expired. Sign in again.',
  requestFailed: 'The request failed. Try again.',
};

export const API_ERROR_BY_CODE: Record<string, string> = {
  PHONE_ALREADY_REGISTERED: API_ERROR.duplicatePhone,
  INVALID_PHONE: API_ERROR.invalidPhone,
  INVALID_SINGAPORE_PHONE: API_ERROR.invalidSingaporePhone,
  UNKNOWN_CITY: API_ERROR.unknownCity,
  SLOT_UNAVAILABLE: API_ERROR.slotUnavailable,
  REFERRER_REQUIRED: API_ERROR.referrerRequired,
  INVALID_CREDENTIALS: API_ERROR.invalidCredentials,
  LOGIN_LOCKED: API_ERROR.loginLocked,
  NOT_AVAILABLE: API_ERROR.reservedByOther,
  LOCK_UNAVAILABLE: API_ERROR.busy,
  LOCK_EXPIRED: API_ERROR.lockExpired,
  NOT_LOCK_OWNER: API_ERROR.reservationNotFound,
  INVALID_START_DATE: API_ERROR.invalidPlacement,
  INVALID_TRANSITION: API_ERROR.invalidTransition,
  EMAIL_ALREADY_REGISTERED: API_ERROR.duplicateLogin,
  RECRUITER_SUSPENDED: API_ERROR.recruiterSuspended,
  FORBIDDEN: API_ERROR.forbidden,
  NOT_FOUND: API_ERROR.candidateNotFound,
  UNAUTHORIZED: API_ERROR.sessionExpired,
};
