import { ReactNode } from 'react';
import { LabelledOption, UserRole } from '@/domain/interface';

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
  crumbItems?: NavItem[];
  sidebarFooter?: ReactNode;
  headerExtra?: ReactNode;
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

export interface LoginShellProps {
  title: string;
  subtitle: string;
  hero?: ReactNode;
  children: ReactNode;
}

export interface ChangePasswordProps {
  role: UserRole;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PublicShellProps {
  leading?: ReactNode;
  actions?: ReactNode;
  narrow?: boolean;
  children: ReactNode;
}

export interface PortalOption {
  title: string;
  description: string;
  action: string;
  to: string;
  primary?: boolean;
}

export interface OptionCardsProps {
  options: PortalOption[];
}

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export interface FilterSelectProps<Value extends string> {
  label: string;
  placeholder: string;
  value?: Value;
  options: LabelledOption<Value>[];
  onChange: (value?: Value) => void;
}
