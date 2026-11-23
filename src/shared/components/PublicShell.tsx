import { Link } from 'react-router-dom';
import { APP_NAME } from '@/domain/constant';
import { HOME_PATH } from '@/shared/auth/constant';
import { PublicShellProps } from './interface';

export const PublicShell = ({ leading, actions, narrow, children }: PublicShellProps) => (
  <div className="public-layout">
    <header className="public-header">
      <span className="public-header-leading">
        <Link to={HOME_PATH} className="brand">
          <span className="brand-logo">T</span>
          {APP_NAME}
        </Link>
        {leading}
      </span>
      {actions && <span className="public-header-actions">{actions}</span>}
    </header>
    <main className={narrow ? 'portal-content public-content public-content-narrow' : 'portal-content public-content'}>{children}</main>
  </div>
);
