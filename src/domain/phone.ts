import { NON_DIGITS, SINGAPORE_DIAL_CODE, SINGAPORE_PHONE_PATTERN, WHITESPACE } from './constant';

export const phoneDigits = (phone: string): string => phone.replace(NON_DIGITS, '');

export const isSingaporePhone = (phone: string): boolean =>
  phone.replace(WHITESPACE, '').startsWith(SINGAPORE_DIAL_CODE);

export const isValidSingaporePhone = (phone: string): boolean => SINGAPORE_PHONE_PATTERN.test(phone.trim());
