import { CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Card, Flex, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { getInitials } from '@/domain/format';
import { CANDIDATE_AVATAR_STYLE, RESULT_TAG_COLOR } from './constant';
import { NoticeProps, PageHeaderProps, ResultTagProps, StatTileProps } from './interface';

export const PageHeader = ({ title, subtitle, extra, back }: PageHeaderProps) => (
  <div className="page-header">
    {back && (
      <Link to={back.to} className="muted small" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← {back.label}
      </Link>
    )}
    <Flex justify="space-between" align="flex-start" gap={16} wrap>
      <div>
        <Typography.Title level={1}>{title}</Typography.Title>
        {subtitle && (
          <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
            {subtitle}
          </Typography.Paragraph>
        )}
      </div>
      {extra}
    </Flex>
  </div>
);

export const StatTile = ({ label, value, hint, to }: StatTileProps) => {
  const tile = (
    <Card className="stat-tile" hoverable={Boolean(to)} style={{ height: '100%' }}>
      <span className="muted small">{label}</span>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </Card>
  );
  return to ? <Link to={to}>{tile}</Link> : tile;
};

export const Notice = ({ tone = 'info', children, style }: NoticeProps) => (
  <div className={`notice notice-${tone}`} style={style}>
    {children}
  </div>
);

export const ResultTag = ({ result, label }: ResultTagProps) => (
  <Tag color={RESULT_TAG_COLOR[result]}>{label ? `${label}: ${result}` : result}</Tag>
);

export const VerificationTag = ({ verified }: { verified: boolean }) =>
  verified ? (
    <Tag color="success" icon={<CheckCircleFilled />}>
      UC Verified
    </Tag>
  ) : (
    <Tag>Unverified</Tag>
  );

export const CandidateAvatar = ({ name, size = 42 }: { name: string; size?: number }) => (
  <Avatar size={size} style={CANDIDATE_AVATAR_STYLE}>
    {getInitials(name)}
  </Avatar>
);
