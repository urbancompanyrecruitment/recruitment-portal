import { CookingFrequency, InterviewCity, ProviderCategory, RecruitmentSource, YesNo } from './interface';

export const APP_NAME = 'TalentLink';

export const INTERVIEW_TIME_ZONE = 'Asia/Singapore';

export const SINGAPORE_INTERVIEW_CITIES: InterviewCity[] = [
  {
    key: 'tampines',
    name: 'Tampines',
    centre: 'UC Tampines Centre',
    address: 'Tampines Central (placeholder — business to confirm)',
    instructions: 'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical test.',
  },
  {
    key: 'jurong-east',
    name: 'Jurong East',
    centre: 'UC Jurong East Centre',
    address: 'Jurong Gateway Road (placeholder — business to confirm)',
    instructions: 'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical test.',
  },
  {
    key: 'woodlands',
    name: 'Woodlands',
    centre: 'UC Woodlands Centre',
    address: 'Woodlands Square (placeholder — business to confirm)',
    instructions: 'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical test.',
  },
  {
    key: 'bedok',
    name: 'Bedok',
    centre: 'UC Bedok Centre',
    address: 'New Upper Changi Road (placeholder — business to confirm)',
    instructions: 'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical test.',
  },
  {
    key: 'ang-mo-kio',
    name: 'Ang Mo Kio',
    centre: 'UC Ang Mo Kio Centre',
    address: 'Ang Mo Kio Avenue 3 (placeholder — business to confirm)',
    instructions: 'Arrive 15 minutes early with your passport or work permit. Wear comfortable clothes for the practical test.',
  },
];

export const SLOT_WINDOW_DAYS = 2;

export const SLOT_START_HOUR = 8;

export const SLOT_END_HOUR = 18;

export const SLOT_CAPACITY = 4;

export const SLOT_ID_SEPARATOR = '_';

export const SLOT_TIME_FORMAT = 'HH:mm';

export const COUNTRIES = ['Singapore', 'Myanmar', 'Thailand', 'Indonesia', 'Philippines', 'India', 'UAE', 'Other'];

export const ASSIGNABLE_CATEGORIES: ProviderCategory[] = [
  ProviderCategory.RegularCleaning,
  ProviderCategory.PremiumCleaning,
  ProviderCategory.Ironing,
];

export const RECRUITMENT_SOURCES: RecruitmentSource[] = Object.values(RecruitmentSource);

export const SOURCES_REQUIRING_REFERRER: RecruitmentSource[] = [
  RecruitmentSource.Recruiter,
  RecruitmentSource.Referral,
  RecruitmentSource.Aggregator,
];

export const COOKING_FREQUENCIES: CookingFrequency[] = Object.values(CookingFrequency);

export const YES_NO: YesNo[] = Object.values(YesNo);

export const MIN_PARTNER_AGE = 18;

export const MAX_PARTNER_AGE = 80;

export const PHONE_PATTERN = /^\+[0-9][0-9\s()-]{6,18}$/;

export const SINGAPORE_DIAL_CODE = '+65';

export const SINGAPORE_PHONE_PATTERN = /^\+65\s?[89]\d{3}\s?\d{4}$/;

export const NON_DIGITS = /\D/g;

export const WHITESPACE = /\s/g;

export const LOCK_TTL_MS = 48 * 60 * 60 * 1000;

export const LOCK_EXPIRED_LABEL = 'Expired';

export const HUB_NOTICE_WINDOW_DAYS = 14;

export const FUNNEL_WEEK_DAYS = 7;

export const DATE_FORMAT = 'D MMM YYYY';

export const DAY_DATE_FORMAT = 'ddd, D MMM YYYY';

export const DATE_TIME_FORMAT = 'D MMM YYYY, HH:mm';

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
