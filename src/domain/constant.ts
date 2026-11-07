import { CookingFrequency, LabelledOption, PartnerState, RecruitmentSource } from './interface';

export const APP_NAME = 'TalentLink';

export const INTERVIEW_TIME_ZONE = 'Asia/Singapore';

export const SLOT_ID_SEPARATOR = '_';

export const COUNTRIES = ['Singapore', 'Myanmar', 'Thailand', 'Indonesia', 'Philippines', 'India', 'UAE', 'Other'];

export const SOURCE_LABEL: Record<RecruitmentSource, string> = {
  [RecruitmentSource.TikTok]: 'TikTok',
  [RecruitmentSource.Facebook]: 'Facebook / Meta',
  [RecruitmentSource.Referral]: 'Professional referral',
  [RecruitmentSource.Recruiter]: 'Recruiter',
  [RecruitmentSource.Aggregator]: 'Aggregator',
  [RecruitmentSource.Influencer]: 'Influencer',
  [RecruitmentSource.Direct]: 'Direct',
  [RecruitmentSource.Other]: 'Other',
};

export const RECRUITMENT_SOURCE_OPTIONS: LabelledOption<RecruitmentSource>[] = Object.values(RecruitmentSource).map(value => ({
  value,
  label: SOURCE_LABEL[value],
}));

export const SOURCES_REQUIRING_REFERRER: RecruitmentSource[] = [
  RecruitmentSource.Recruiter,
  RecruitmentSource.Referral,
  RecruitmentSource.Aggregator,
];

export const COOKING_FREQUENCY_LABEL: Record<CookingFrequency, string> = {
  [CookingFrequency.Never]: 'Never',
  [CookingFrequency.Occasionally]: 'Occasionally',
  [CookingFrequency.Frequently]: 'Frequently',
  [CookingFrequency.VeryFrequently]: 'Very frequently',
  [CookingFrequency.Daily]: 'Daily',
};

export const COOKING_FREQUENCY_OPTIONS: LabelledOption<CookingFrequency>[] = Object.values(CookingFrequency).map(value => ({
  value,
  label: COOKING_FREQUENCY_LABEL[value],
}));

export const YES_NO_OPTIONS: LabelledOption<boolean>[] = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

export const PLACED_STATES: PartnerState[] = [PartnerState.Placed, PartnerState.Joined];

export const MIN_PARTNER_AGE = 18;

export const MAX_PARTNER_AGE = 80;

export const PASSWORD_MIN_LENGTH = 8;

export const PHONE_PATTERN = /^\+[0-9][0-9\s()-]{6,18}$/;

export const SINGAPORE_DIAL_CODE = '+65';

export const SINGAPORE_PHONE_PATTERN = /^\+65\s?[89]\d{3}\s?\d{4}$/;

export const NON_DIGITS = /\D/g;

export const WHITESPACE = /\s/g;

export const LOCK_EXPIRED_LABEL = 'Expired';

export const FUNNEL_WEEK_DAYS = 7;

export const DATE_FORMAT = 'D MMM YYYY';

export const DAY_DATE_FORMAT = 'ddd, D MMM YYYY';

export const DATE_TIME_FORMAT = 'D MMM YYYY, HH:mm';

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const DEMO_PASSWORD = 'Demo123!';
