import { RegistrationCopy, RegistrationMode } from './interface';

export const SLOT_DAY_FORMAT = 'ddd, D MMM';

export const NAME_PART_MAX_LENGTH = 59;

/** Long question on a full-width row; the control keeps the half width of the fields above it. */
export const COOKING_WRAPPER_COL = { xs: 24, md: 12 };

export const PRIMARY_PHONE_ERROR = 'Use + and country code, e.g. +65 9123 4567';

export const SINGAPORE_PHONE_ERROR = 'Use a Singapore mobile number, e.g. +65 9123 4567';

export const CONSENT_ERROR = 'Consent is required to register';

export const REFERRER_ERROR = 'Add the recruiter, referrer or aggregator name';

export const INTERVIEW_CITY_ERROR = 'Choose an interview city';

export const INTERVIEW_SLOT_ERROR = 'Choose an interview slot';

export const CHOOSE_CITY_MESSAGE = 'Choose a city to see the next available slots and centre details.';

export const NO_SLOTS_MESSAGE = 'No slots are available in the next days. Please try again later or choose another city.';

export const INTERVIEW_CITY_HINT = {
  noCountry: 'Choose the current country first.',
  country: 'Centres in the current country are listed. Pick the closest one.',
  single: 'This is the interview centre for the current country. Pick a slot below.',
  others: 'Every interview city is listed. Pick the most convenient one.',
};

export const REGISTRATION_COPY: Record<RegistrationMode, RegistrationCopy> = {
  [RegistrationMode.Partner]: {
    detailsTitle: 'Your details',
    interviewTitle: 'Your interview',
    lastNameHint: 'You sign in with your primary mobile number and this last name.',
    primaryPhoneHint: 'Include the country code. You sign in with this number and the team contacts you on it.',
    singaporePhoneHint: 'Optional. Needed before you can start work; you can share it later with the team.',
    copyPrimaryLabel: 'My primary number is my Singapore number',
    cookingLabel: 'How often did you cook in previous work?',
    consent: 'I consent to my details being collected and to being registered as a candidate.',
    termsNote: 'By registering you accept the',
    submit: 'Complete registration →',
    slotNotice: 'Your slot is confirmed when you submit. The business team will contact you before the interview.',
  },
  [RegistrationMode.Recruiter]: {
    detailsTitle: 'Candidate details',
    interviewTitle: 'Candidate interview',
    lastNameHint: 'The candidate signs in with their primary mobile number and this last name.',
    primaryPhoneHint: 'Include the country code. The candidate signs in with this number and the team contacts them on it.',
    singaporePhoneHint: 'Optional. Needed before the candidate can start work; the team can add it later.',
    copyPrimaryLabel: 'The primary number is the Singapore number',
    cookingLabel: 'How often did the candidate cook in previous work?',
    consent: 'The candidate consents to these details being collected and to being registered as a candidate.',
    termsNote: 'By registering the candidate you confirm that they accept the',
    submit: 'Register candidate →',
    slotNotice: 'The slot is confirmed when you submit. The business team will contact the candidate before the interview.',
  },
};
