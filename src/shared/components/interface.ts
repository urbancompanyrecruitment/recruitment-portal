import { ReactNode } from 'react';
import { StageResult, UserRole } from '@/domain/interface';

export type NoticeTone = 'info' | 'success' | 'warning';

export interface NavItem {
  path: string;
  label: string;
  badge?: number;
}

export interface PortalShellProps {
  role: UserRole;
  workspace: string;
  navItems: NavItem[];
  sidebarFooter?: ReactNode;
}

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  back?: { to: string; label: string };
}

export interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  to?: string;
}

export interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
  style?: React.CSSProperties;
}

export interface ResultTagProps {
  result: StageResult;
  label?: string;
}

export interface DemoAccount {
  label: string;
  loginId: string;
}

export interface StaffLoginProps {
  role: UserRole;
  title: string;
  subtitle: string;
  demoAccounts: DemoAccount[];
  hero?: ReactNode;
}

export interface LoginFormValues {
  loginId: string;
  password: string;
}
