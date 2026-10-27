import { Button, Card, Col, Flex, Popconfirm, Row, Typography } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { resetMockData } from '@/api/reservations';
import { APP_NAME } from '@/domain/constant';
import { Notice } from '@/shared/components/ui';
import { PORTALS } from './constant';

export const PortalDirectory = () => {
  const queryClient = useQueryClient();

  return (
    <div className="portal-content" style={{ maxWidth: 1050 }}>
      <div className="brand" style={{ marginBottom: 32 }}>
        <span className="brand-logo">T</span>
        {APP_NAME}
      </div>
      <Typography.Title level={1}>Recruitment & onboarding portals</Typography.Title>
      <Typography.Paragraph type="secondary">
        Four role-based portals sharing one mock dataset. Changes made in one portal show up in the others.
      </Typography.Paragraph>
      <Notice tone="warning">
        Mock data only — stored in this browser&apos;s localStorage. No messages are sent and no backend is called.
      </Notice>
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
      <Flex justify="flex-end" style={{ marginTop: 24 }}>
        <Popconfirm
          title="Reset all mock data to the original sample?"
          onConfirm={async () => {
            await resetMockData();
            await queryClient.invalidateQueries();
          }}
        >
          <Button>Reset sample data</Button>
        </Popconfirm>
      </Flex>
    </div>
  );
};
