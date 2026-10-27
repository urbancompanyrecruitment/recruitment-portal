import {
  AssessmentStage,
  CookingFrequency,
  Geography,
  ProviderCategory,
  RecruitmentSource,
  StageResult,
  YesNo,
} from './interface';

export const APP_NAME = 'TalentLink';

export const ASSESSMENT_STAGES: AssessmentStage[] = [AssessmentStage.L1, AssessmentStage.L2, AssessmentStage.L3];

export const STAGE_LABEL: Record<AssessmentStage, string> = {
  [AssessmentStage.L1]: 'L1',
  [AssessmentStage.L2]: 'L2',
  [AssessmentStage.L3]: 'L3',
};

export const STAGE_DESCRIPTION: Record<AssessmentStage, string> = {
  [AssessmentStage.L1]: 'English interview',
  [AssessmentStage.L2]: 'Cleaning interview',
  [AssessmentStage.L3]: 'Situation / customer MCQ',
};

export const PENDING_RESULTS: Record<AssessmentStage, StageResult> = {
  [AssessmentStage.L1]: StageResult.Pending,
  [AssessmentStage.L2]: StageResult.Pending,
  [AssessmentStage.L3]: StageResult.Pending,
};

export const GEOGRAPHIES: Geography[] = [Geography.Singapore, Geography.Myanmar, Geography.Overseas];

export const GEOGRAPHY_TIME_ZONE: Record<Geography, string> = {
  [Geography.Singapore]: 'Asia/Singapore',
  [Geography.Myanmar]: 'Asia/Yangon',
  [Geography.Overseas]: 'Asia/Singapore',
};

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

export const RESERVATION_WINDOW_MS = 48 * 60 * 60 * 1000;

export const HUB_NOTICE_WINDOW_DAYS = 14;

export const FUNNEL_WEEK_DAYS = 7;

export const DATE_FORMAT = 'D MMM YYYY';

export const DAY_DATE_FORMAT = 'ddd, D MMM YYYY';

export const DATE_TIME_FORMAT = 'D MMM YYYY, HH:mm';

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
