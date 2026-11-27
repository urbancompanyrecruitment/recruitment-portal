import { APP_NAME } from '@/domain/constant';
import { UserRole } from '@/domain/interface';
import { PORTAL_PATH } from '@/shared/auth/constant';
import { PortalOption } from '@/shared/components/interface';

export const HOME = {
  title: `Welcome to ${APP_NAME}`,
  subtitle: 'The recruitment and onboarding portal for cleaning professionals in Singapore. Choose where you want to go.',
};

export const HOME_OPTIONS: PortalOption[] = [
  {
    title: 'I am a candidate',
    description: 'Register as a candidate, choose your interview slot, or sign in to follow your progress.',
    action: 'Go to the candidate dashboard →',
    to: PORTAL_PATH[UserRole.Partner],
    primary: true,
  },
  {
    title: 'I am a recruiter',
    description: 'Request a recruiter account, or sign in to find verified candidates and record placements.',
    action: 'Go to the recruiter dashboard →',
    to: PORTAL_PATH[UserRole.Recruiter],
  },
];
