import { CookingFrequency, Geography, RecruitmentSource, YesNo } from '@/domain/interface';

export interface RegistrationFormValues {
  name: string;
  primaryPhone: string;
  singaporePhone?: string;
  country: string;
  city: string;
  nationality: string;
  age: number;
  source: RecruitmentSource;
  referrer?: string;
  comfortableWithDogs: YesNo;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: YesNo;
  consent: boolean;
  interviewGeography: Geography;
  slotId?: string;
}
