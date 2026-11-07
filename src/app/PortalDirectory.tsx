import { Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/domain/constant';
import { Notice } from '@/shared/components/ui';
import { DIRECTORY_NOTE, PORTALS } from './constant';

export const PortalDirectory = () => (
  <div className="portal-content" style={{ maxWidth: 1050 }}>
    <div className="brand" style={{ marginBottom: 32 }}>
      <span className="brand-logo">T</span>
      {APP_NAME}
    </div>
    <Typography.Title level={1}>Recruitment & onboarding portals</Typography.Title>
    <Typography.Paragraph type="secondary">
      Three role-based portals served by partner-recruitment-service. Changes made in one portal show up in the others.
    </Typography.Paragraph>
    <Notice>{DIRECTORY_NOTE}</Notice>
    <Row gutter={[18, 18]}>
      {PORTALS.map(portal => (
        <Col xs={24} md={12} key={portal.path}>
          <Link to={portal.path}>
            <Card hoverable style={{ height: '100%' }}>
              <Typography.Title level={4}>{portal.title}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {portal.description}
              </Typography.Paragraph>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  </div>
);
