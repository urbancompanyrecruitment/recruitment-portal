import { Flex, Select } from 'antd';
import { useCandidates, useInterviewCities } from '@/api/hooks';
import { PARTNER_STATE_OPTIONS, RECRUITMENT_SOURCE_OPTIONS } from '@/domain/constant';
import { PartnerFiltersProps } from '../interface';

export const PartnerFilters = ({ value, onChange }: PartnerFiltersProps) => {
  const { data: candidates = [] } = useCandidates();
  const { data: cities = [] } = useInterviewCities();

  return (
    <Flex gap={12} wrap>
      <Select
        allowClear
        aria-label="Filter by interview city"
        placeholder="All interview cities"
        className="admin-filter"
        value={value.cityKey}
        onChange={cityKey => onChange({ ...value, cityKey })}
        options={cities.map(city => ({ value: city.key, label: city.name }))}
      />
      <Select
        allowClear
        aria-label="Filter by channel"
        placeholder="All channels"
        className="admin-filter"
        value={value.source}
        onChange={source => onChange({ ...value, source })}
        options={RECRUITMENT_SOURCE_OPTIONS.filter(option => candidates.some(candidate => candidate.source === option.value))}
      />
      <Select
        allowClear
        aria-label="Filter by status"
        placeholder="All statuses"
        className="admin-filter"
        value={value.state}
        onChange={state => onChange({ ...value, state })}
        options={PARTNER_STATE_OPTIONS}
      />
    </Flex>
  );
};
