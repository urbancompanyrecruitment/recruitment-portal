import { Typography } from 'antd';
import { APP_NAME } from '@/domain/constant';
import { LoginShellProps } from './interface';

export const LoginShell = ({ title, subtitle, hero, children }: LoginShellProps) => (
  <div className={hero ? 'staff-login' : 'staff-login staff-login-simple'}>
    {hero && <div className="staff-login-hero">{hero}</div>}
    <div className="staff-login-form">
      <section>
        <div className="brand" style={{ marginBottom: 28 }}>
          <span className="brand-logo">T</span>
          {APP_NAME}
        </div>
        <Typography.Title level={2} style={{ marginBottom: 4 }}>
          {title}
        </Typography.Title>
        <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
        {children}
      </section>
    </div>
  </div>
);
