import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Tag, Typography } from 'antd';
import { UserRole } from '@/domain/interface';
import { CANDIDATE_AVATAR_STYLE } from '@/shared/components/constant';
import { StaffLogin } from '@/shared/components/StaffLogin';
import { VerificationTag } from '@/shared/components/ui';
import { HERO_SKILL_TAGS, RECRUITER_DEMO_ACCOUNTS } from '../constant';

export const LoginPage = () => (
  <StaffLogin
    role={UserRole.Recruiter}
    title="Welcome back"
    subtitle="Sign in to your recruitment workspace. Accounts are issued by the business team."
    demoAccounts={RECRUITER_DEMO_ACCOUNTS}
    hero={
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
    }
  />
);
