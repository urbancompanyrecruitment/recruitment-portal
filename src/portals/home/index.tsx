import { PublicShell } from '@/shared/components/PublicShell';
import { OptionCards, PageHeader } from '@/shared/components/ui';
import { HOME, HOME_OPTIONS } from './constant';

const HomePortal = () => (
  <PublicShell>
    <PageHeader title={HOME.title} subtitle={HOME.subtitle} />
    <OptionCards options={HOME_OPTIONS} />
  </PublicShell>
);

export default HomePortal;
