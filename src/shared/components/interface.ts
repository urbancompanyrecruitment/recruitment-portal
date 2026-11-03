import { ReactNode } from 'react';
import { StageResult, UserRole } from '@/domain/interface';

declare global {
  interface Window {
    google?: typeof google;
  }
}

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

export interface LoginShellProps {
  title: string;
  subtitle: string;
  hero?: ReactNode;
  children: ReactNode;
}

export interface GoogleSignInProps {
  onCredential: (credential: string) => void;
}
