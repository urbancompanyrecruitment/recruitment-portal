import { OptionCards, PageHeader } from '@/shared/components/ui';
import { PARTNER_HOME, PARTNER_HOME_OPTIONS } from '../constant';

export const HomePage = () => (
  <>
    <PageHeader title={PARTNER_HOME.title} subtitle={PARTNER_HOME.subtitle} />
    <OptionCards options={PARTNER_HOME_OPTIONS} />
  </>
);
