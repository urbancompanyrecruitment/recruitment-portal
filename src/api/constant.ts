export const QUERY_KEY = {
  candidates: (geography?: string) => ['candidates', geography ?? 'all'],
  candidate: (id: string) => ['candidate', id],
  registration: (id: string) => ['registration', id],
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
} as const;

export const NON_DIGITS = /\D/g;

export const API_ERROR = {
  candidateNotFound: 'Candidate not found.',
  slotNotFound: 'Interview slot not found.',
  trainerNotFound: 'Trainer not found.',
  recruiterNotFound: 'Recruiter not found.',
  aggregatorNotFound: 'Aggregator not found.',
  reservationNotFound: 'This profile is not reserved for you. It may have expired.',
  duplicatePhone: 'This WhatsApp number is already registered.',
  slotUnavailable: 'That slot is now full or unavailable. Choose another slot.',
  stageLocked: 'Earlier stages must be passed before recording this result.',
  verificationLocked: 'All three stages must be passed before confirming UC Verified.',
  profileUnavailable: 'This profile is unavailable.',
  reservedByOther: 'This profile is reserved by another recruiter.',
  reservationExpired: 'Reservation expired. Select an available profile.',
  invalidPlacement: 'Choose a valid joining date and approved aggregator.',
  duplicateLogin: 'This login already exists.',
  invalidSlot: 'Use a future date and a positive capacity.',
  duplicateSession: 'This trainer already has a session at that date and time.',
  invalidCredentials: 'Check your login ID and password.',
  invalidQuota: 'Quota cannot be negative.',
};
