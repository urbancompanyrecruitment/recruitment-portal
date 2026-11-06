import { CookingFrequency, RecruitmentSource, YesNo } from '@/domain/interface';

export interface RegistrationFormValues {
  name: string;
  primaryPhone: string;
  password: string;
  confirmPassword: string;
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
  interviewCity: string;
  slotId?: string;
}

export interface PartnerLoginFormValues {
  primaryPhone: string;
  password: string;
}
