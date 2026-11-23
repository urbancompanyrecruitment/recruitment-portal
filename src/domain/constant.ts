import {
  AdminRole,
  CookingFrequency,
  LabelledOption,
  PartnerCountry,
  PartnerState,
  RecruiterStatus,
  RecruitmentSource,
  SlotRowOutcome,
  TagStyle,
} from './interface';

export const APP_NAME = 'TalentLink';

export const TERMS = {
  label: 'Terms and Conditions (PDF)',
  partnerPdf: '/terms/partner-terms-and-conditions.pdf',
  recruiterPdf: '/terms/recruiter-terms-and-conditions.pdf',
};

export const INTERVIEW_TIME_ZONE = 'Asia/Singapore';

export const SLOT_ID_SEPARATOR = '_';

export const PARTNER_COUNTRY_OPTIONS: LabelledOption<PartnerCountry>[] = Object.values(PartnerCountry).map(value => ({
  value,
  label: value,
}));

export const NATIONALITIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Côte d’Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Türkiye', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

export const NATIONALITY_OPTIONS: LabelledOption<string>[] = NATIONALITIES.map(value => ({ value, label: value }));

export const PARTNER_STATE_TAG: Record<PartnerState, TagStyle> = {
  [PartnerState.SignedUp]: { label: 'Signed up' },
  [PartnerState.Verified]: { label: 'UC Verified', color: 'success' },
  [PartnerState.VerificationFailed]: { label: 'Verification failed', color: 'error' },
  [PartnerState.Placed]: { label: 'Placed', color: 'purple' },
  [PartnerState.Joined]: { label: 'Joined', color: 'blue' },
};

export const PARTNER_STATE_OPTIONS: LabelledOption<PartnerState>[] = Object.values(PartnerState).map(value => ({
  value,
  label: PARTNER_STATE_TAG[value].label,
}));

export const RECRUITER_STATUS_TAG: Record<RecruiterStatus, TagStyle> = {
  [RecruiterStatus.Pending]: { label: 'Waiting for approval', color: 'warning' },
  [RecruiterStatus.Active]: { label: 'Active', color: 'success' },
  [RecruiterStatus.Suspended]: { label: 'Suspended', color: 'error' },
  [RecruiterStatus.Rejected]: { label: 'Rejected' },
};

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  [AdminRole.SuperAdmin]: 'Super admin',
  [AdminRole.Admin]: 'Admin',
};

export const ADMIN_ROLE_OPTIONS: LabelledOption<AdminRole>[] = Object.values(AdminRole).map(value => ({
  value,
  label: ADMIN_ROLE_LABEL[value],
}));

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

export const LOCK_NO_EXPIRY_LABEL = 'No expiry';

export const LOCK_DAYS = 3;

export const MINUTES_PER_HOUR = 60;

export const MINUTES_PER_DAY = 1440;

export const MS_PER_MINUTE = 60000;

export const FUNNEL_WEEK_DAYS = 7;

export const DATE_FORMAT = 'D MMM YYYY';

export const DAY_DATE_FORMAT = 'ddd, D MMM YYYY';

export const DATE_TIME_FORMAT = 'D MMM YYYY, HH:mm';

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const SAVED_SLOT_OUTCOMES: SlotRowOutcome[] = [SlotRowOutcome.Created, SlotRowOutcome.Updated];
