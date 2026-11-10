import { Button, Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components/ui';
import { PARTNER_HOME, PARTNER_ROUTE } from '../constant';

const OPTIONS = [
  { ...PARTNER_HOME.register, to: PARTNER_ROUTE.registration, primary: true },
  { ...PARTNER_HOME.login, to: PARTNER_ROUTE.login, primary: false },
];

export const HomePage = () => (
  <>
    <PageHeader title={PARTNER_HOME.title} subtitle={PARTNER_HOME.subtitle} />
    <Row gutter={[18, 18]}>
      {OPTIONS.map(option => (
        <Col xs={24} md={12} key={option.to}>
          <Card className="home-option" style={{ height: '100%' }}>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {option.title}
            </Typography.Title>
            <Typography.Paragraph type="secondary">{option.description}</Typography.Paragraph>
            <Link to={option.to}>
              <Button type={option.primary ? 'primary' : 'default'} size="large">
                {option.action}
              </Button>
            </Link>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);
