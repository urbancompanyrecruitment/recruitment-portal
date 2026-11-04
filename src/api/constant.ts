export const QUERY_KEY = {
  candidates: ['candidates'],
  slots: ['slots'],
  bookableSlots: (geography: string) => ['slots', 'bookable', geography],
  trainers: ['trainers'],
  recruiters: ['recruiters'],
  aggregators: ['aggregators'],
  reservations: ['reservations'],
  reservationEvents: ['reservation-events'],
  availableCandidates: ['available-candidates'],
  myReservations: (recruiterId: string) => ['my-reservations', recruiterId],
  candidateProfile: (candidateId: string, recruiterId: string) => ['candidate-profile', candidateId, recruiterId],
  currentUser: ['current-user'],
} as const;

export const TOKEN_COOKIE = 'token';

export const TOKEN_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export const HTTP_UNAUTHORIZED = 401;

export const AUTH_ENDPOINT = {
  googleLogin: '/auth/google/login',
  currentUser: 'user/me',
};

export const API_ERROR = {
  candidateNotFound: 'Candidate not found.',
  slotNotFound: 'Interview slot not found.',
  trainerNotFound: 'Trainer not found.',
  recruiterNotFound: 'Recruiter not found.',
  aggregatorNotFound: 'Aggregator not found.',
  reservationNotFound: 'This profile is not locked by you. It may have expired.',
  lockExpired: 'Your lock on this profile has expired. It is back in the pool.',
  duplicatePhone: 'This primary mobile number is already registered.',
  invalidSingaporePhone: 'Enter a valid Singapore mobile number (+65 8xxx xxxx or 9xxx xxxx).',
  slotUnavailable: 'That slot is now full or unavailable. Choose another slot.',
  profileUnavailable: 'This profile is unavailable.',
  reservedByOther: 'This profile is locked by another recruiter.',
  invalidPlacement: 'Choose a valid joining date and approved aggregator.',
  duplicateLogin: 'This login already exists.',
  invalidSlot: 'Use a future date and a positive capacity.',
  duplicateSession: 'This trainer already has a session at that date and time.',
  invalidCredentials: 'Check your login ID and password.',
  invalidQuota: 'Quota cannot be negative.',
  sessionExpired: 'Your session has expired. Sign in again.',
  requestFailed: 'The request failed. Try again.',
};
