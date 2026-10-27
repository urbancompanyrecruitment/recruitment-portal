import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Input, Row, Select, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import { UserRole } from '@/domain/interface';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, Notice, PageHeader, VerificationTag } from '@/shared/components/ui';
import { CATEGORY_OPTIONS, DEFAULT_PROFILE_FILTERS, PROFILE_SORT_OPTIONS, PROFILE_SORTERS } from '../constant';
import { useAvailableCandidates, useOpenProfile } from '../hooks';
import { ProfileFilters } from '../interface';

export const ProfilesPage = () => {
  const user = useSessionUser(UserRole.Recruiter);
  const { data = [], isLoading } = useAvailableCandidates();
  const { openProfile, openingId } = useOpenProfile(user.id);
  const [filters, setFilters] = useState<ProfileFilters>(DEFAULT_PROFILE_FILTERS);

  const search = filters.search.trim().toLowerCase();
  const countryOptions = [...new Set(data.map(candidate => candidate.country))]
    .toSorted()
    .map(country => ({ value: country, label: country }));
  const visible = data
    .filter(candidate => !search || `${candidate.name} ${candidate.bio}`.toLowerCase().includes(search))
    .filter(candidate => !filters.country || candidate.country === filters.country)
    .filter(candidate => !filters.category || candidate.category === filters.category)
    .toSorted(PROFILE_SORTERS[filters.sort]);
  const updateFilters = (change: Partial<ProfileFilters>) => setFilters(current => ({ ...current, ...change }));

  return (
    <>
      <PageHeader
        title="Available profiles"
        subtitle="Professionals who passed L1, L2 and L3 and were confirmed UC Verified."
      />
      <Notice>
        <strong>Opening a profile reveals the phone number and reserves it for you.</strong>{' '}
        It immediately disappears from other recruiters&apos; available lists.
      </Notice>
      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={9}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name or experience"
              aria-label="Search profiles"
              value={filters.search}
              onChange={event => updateFilters({ search: event.target.value })}
            />
          </Col>
          <Col xs={24} sm={8} lg={5}>
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
          <Col xs={24} sm={8} lg={5}>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder="All categories"
              aria-label="Category"
              options={CATEGORY_OPTIONS}
              value={filters.category}
              onChange={category => updateFilters({ category })}
            />
          </Col>
          <Col xs={24} sm={8} lg={5}>
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
                    {candidate.city}, {candidate.country}
                  </div>
                  <Typography.Paragraph className="recruiter-profile-bio">{candidate.bio}</Typography.Paragraph>
                  <Flex gap={24} className="recruiter-facts">
                    <div>
                      <div className="recruiter-fact-label">Category</div>
                      <div className="recruiter-fact-value">{candidate.category}</div>
                    </div>
                    <div>
                      <div className="recruiter-fact-label">Experience</div>
                      <div className="recruiter-fact-value">{candidate.yearsOfExperience} years</div>
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
