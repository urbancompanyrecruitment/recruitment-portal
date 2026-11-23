import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Tag, Typography } from 'antd';
import { CANDIDATE_AVATAR_STYLE } from '@/shared/components/constant';
import { VerificationTag } from '@/shared/components/ui';
import { HERO_SKILL_TAGS } from '../constant';

export const RecruiterHero = () => (
  <div className="recruiter-hero">
    <span className="eyebrow">Approved recruiter access</span>
    <h1 className="recruiter-hero-title">The right people. The next opportunity.</h1>
    <Typography.Paragraph className="recruiter-hero-text">
      Discover UC-verified professionals and guide their next step, from first conversation to placement.
    </Typography.Paragraph>
    <div className="recruiter-hero-card">
      <Flex justify="space-between" align="center" gap={12}>
        <span className="eyebrow">Verified talent network</span>
        <VerificationTag verified />
      </Flex>
      <Flex align="center" gap={14} style={{ margin: '20px 0 18px' }}>
        <Avatar size={52} icon={<UserOutlined />} style={CANDIDATE_AVATAR_STYLE} />
        <div>
          <Typography.Text strong>Ready for a new opportunity</Typography.Text>
          <div className="muted small">Assessed. Verified. Ready to connect.</div>
        </div>
      </Flex>
      <Flex gap={6} wrap>
        {HERO_SKILL_TAGS.map(skill => (
          <Tag key={skill}>{skill}</Tag>
        ))}
      </Flex>
    </div>
  </div>
);
