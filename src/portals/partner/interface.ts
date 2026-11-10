import { CookingFrequency, RecruitmentSource } from '@/domain/interface';

export interface RegistrationFormValues {
  name: string;
  email: string;
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
  comfortableWithDogs: boolean;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: boolean;
  consent: boolean;
  interviewCity: string;
  slotId: string;
}

export interface PartnerLoginFormValues {
  email: string;
  password: string;
}
