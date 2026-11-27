import { UserRole } from '@/domain/interface';

export interface PasswordResetPageProps {
  role: UserRole.Recruiter | UserRole.Admin;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
