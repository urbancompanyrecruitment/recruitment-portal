import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Input, Row, Select, Skeleton, Tag, Typography } from 'antd';
import { useState } from 'react';
import { COOKING_FREQUENCY_LABEL } from '@/domain/constant';
import { CandidateAvatar, Notice, PageHeader, VerificationTag } from '@/shared/components/ui';
import { DEFAULT_PROFILE_FILTERS, PROFILE_SORT_OPTIONS, PROFILE_SORTERS } from '../constant';
import { useAvailableCandidates, useOpenProfile } from '../hooks';
import { ProfileFilters } from '../interface';

export const ProfilesPage = () => {
  const { data = [], isLoading } = useAvailableCandidates();
  const { openProfile, openingId } = useOpenProfile();
  const [filters, setFilters] = useState<ProfileFilters>(DEFAULT_PROFILE_FILTERS);

  const search = filters.search.trim().toLowerCase();
  const countryOptions = [...new Set(data.map(candidate => candidate.country))]
    .toSorted()
    .map(country => ({ value: country, label: country }));
  const visible = data
    .filter(
      candidate =>
        !search || `${candidate.name} ${candidate.nationality} ${candidate.city}`.toLowerCase().includes(search),
    )
    .filter(candidate => !filters.country || candidate.country === filters.country)
    .toSorted(PROFILE_SORTERS[filters.sort]);
  const updateFilters = (change: Partial<ProfileFilters>) => setFilters(current => ({ ...current, ...change }));

  return (
    <>
      <PageHeader title="Available profiles" subtitle="Professionals confirmed UC Verified after the assessment." />
      <Notice>
        <strong>Opening a profile reveals the phone numbers and locks it for you.</strong>{' '}
        It immediately disappears from other recruiters&apos; available lists.
      </Notice>
      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={12}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name, nationality or city"
              aria-label="Search profiles"
              value={filters.search}
              onChange={event => updateFilters({ search: event.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="All countries"
              aria-label="Current country"
              options={countryOptions}
              value={filters.country}
              onChange={country => updateFilters({ country })}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              style={{ width: '100%' }}
              aria-label="Sort profiles"
              options={PROFILE_SORT_OPTIONS}
              value={filters.sort}
              onChange={sort => updateFilters({ sort })}
            />
          </Col>
        </Row>
      </Card>
      <Skeleton active loading={isLoading}>
        <Typography.Paragraph type="secondary">{visible.length} available professionals</Typography.Paragraph>
        {visible.length ? (
          <Row gutter={[18, 18]}>
            {visible.map(candidate => (
              <Col key={candidate.id} xs={24} md={12} lg={8}>
                <Card className="recruiter-profile-card">
                  <Flex justify="space-between" align="flex-start" gap={8}>
                    <CandidateAvatar name={candidate.name} size={48} />
                    <VerificationTag verified={candidate.verified} />
                  </Flex>
                  <Typography.Title level={4} style={{ margin: '14px 0 2px' }}>
                    {candidate.name}
                  </Typography.Title>
                  <div className="muted small">
                    {candidate.city}, {candidate.country} · {candidate.nationality} · {candidate.age} years
                  </div>
                  <Flex gap={6} wrap className="recruiter-profile-bio">
                    {candidate.deepCleaningExperience && <Tag>Deep cleaning</Tag>}
                    {candidate.comfortableWithDogs && <Tag>Comfortable with dogs</Tag>}
                    {candidate.hasSingaporePhone && <Tag color="blue">Singapore number</Tag>}
                  </Flex>
                  <Flex gap={24} className="recruiter-facts">
                    <div>
                      <div className="recruiter-fact-label">Cooking</div>
                      <div className="recruiter-fact-value">{COOKING_FREQUENCY_LABEL[candidate.cookingFrequency]}</div>
                    </div>
                    <div>
                      <div className="recruiter-fact-label">Nationality</div>
                      <div className="recruiter-fact-value">{candidate.nationality}</div>
                    </div>
                  </Flex>
                  <Button
                    type="primary"
                    block
                    loading={openingId === candidate.id}
                    disabled={Boolean(openingId) && openingId !== candidate.id}
                    onClick={() => openProfile(candidate.id)}
                  >
                    Open profile →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Empty description="No professionals match these filters.">
              <Button onClick={() => setFilters(DEFAULT_PROFILE_FILTERS)}>Clear filters</Button>
            </Empty>
          </Card>
        )}
      </Skeleton>
    </>
  );
};
