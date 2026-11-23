import { PublicShell } from '@/shared/components/PublicShell';
import { OptionCards, PageHeader } from '@/shared/components/ui';
import { RECRUITER_HOME, RECRUITER_HOME_OPTIONS } from '../constant';

export const HomePage = () => (
  <PublicShell>
    <PageHeader title={RECRUITER_HOME.title} subtitle={RECRUITER_HOME.subtitle} />
    <OptionCards options={RECRUITER_HOME_OPTIONS} />
  </PublicShell>
);
