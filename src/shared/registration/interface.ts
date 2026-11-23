import { CookingFrequency, PartnerCountry, RecruitmentSource } from '@/domain/interface';

export enum RegistrationMode {
  Partner = 'partner',
  Recruiter = 'recruiter',
}

export interface RegistrationCopy {
  detailsTitle: string;
  interviewTitle: string;
  lastNameHint: string;
  primaryPhoneHint: string;
  singaporePhoneHint: string;
  copyPrimaryLabel: string;
  cookingLabel: string;
  consent: string;
  termsNote: string;
  submit: string;
  slotNotice: string;
}

export interface PartnerDetailsFormValues {
  firstName: string;
  lastName: string;
  primaryPhone: string;
  singaporePhone?: string;
  country: PartnerCountry;
  city: string;
  nationality: string;
  age: number;
  source?: RecruitmentSource;
  referrer?: string;
  comfortableWithDogs: boolean;
  cookingFrequency: CookingFrequency;
  deepCleaningExperience: boolean;
  consent: boolean;
  interviewCity: string;
  slotId: string;
}

export interface PartnerDetailsFormProps {
  mode: RegistrationMode;
  submitting: boolean;
  onSubmit: (values: PartnerDetailsFormValues) => void;
}

export interface SlotPickerProps {
  country?: string;
}
