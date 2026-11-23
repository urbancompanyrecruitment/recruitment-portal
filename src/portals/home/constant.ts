import { APP_NAME } from '@/domain/constant';
import { UserRole } from '@/domain/interface';
import { PORTAL_PATH } from '@/shared/auth/constant';
import { PortalOption } from '@/shared/components/interface';

export const HOME = {
  title: `Welcome to ${APP_NAME}`,
  subtitle: 'Urban Company’s recruitment and onboarding portal for cleaning partners in Singapore. Choose where you want to go.',
};

export const HOME_OPTIONS: PortalOption[] = [
  {
    title: 'I am a partner',
    description: 'Register as an Urban Company partner, choose your interview slot, or sign in to follow your progress.',
    action: 'Go to the partner dashboard →',
    to: PORTAL_PATH[UserRole.Partner],
    primary: true,
  },
  {
    title: 'I am a recruiter',
    description: 'Request a recruiter account, or sign in to find UC-verified partners and record placements.',
    action: 'Go to the recruiter dashboard →',
    to: PORTAL_PATH[UserRole.Recruiter],
  },
];
