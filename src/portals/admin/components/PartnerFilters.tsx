import { Flex, Select } from 'antd';
import { useCandidates, useInterviewCities } from '@/api/hooks';
import { PARTNER_STATE_OPTIONS, RECRUITMENT_SOURCE_OPTIONS } from '@/domain/constant';
import { FilterSelect } from '@/shared/components/ui';
import { SINGAPORE_PHONE_FILTER_OPTIONS } from '../constant';
import { PartnerFiltersProps } from '../interface';

export const PartnerFilters = ({ value, onChange, children }: PartnerFiltersProps) => {
  const { data: candidates = [] } = useCandidates();
  const { data: cities = [] } = useInterviewCities();

  return (
    <Flex gap={12} wrap>
      <Select
        allowClear
        aria-label="Filter by interview city"
        placeholder="All interview cities"
        className="list-filter"
        value={value.cityKey}
        onChange={cityKey => onChange({ ...value, cityKey })}
        options={cities.map(city => ({ value: city.key, label: city.name }))}
      />
      <Select
        allowClear
        aria-label="Filter by channel"
        placeholder="All channels"
        className="list-filter"
        value={value.source}
        onChange={source => onChange({ ...value, source })}
        options={RECRUITMENT_SOURCE_OPTIONS.filter(option => candidates.some(candidate => candidate.source === option.value))}
      />
      <Select
        allowClear
        aria-label="Filter by status"
        placeholder="All statuses"
        className="list-filter"
        value={value.state}
        onChange={state => onChange({ ...value, state })}
        options={PARTNER_STATE_OPTIONS}
      />
      <FilterSelect
        label="Filter by Singapore number"
        placeholder="Singapore number: any"
        value={value.hasSingaporePhone}
        options={SINGAPORE_PHONE_FILTER_OPTIONS}
        onChange={hasSingaporePhone => onChange({ ...value, hasSingaporePhone })}
      />
      {children}
    </Flex>
  );
};
