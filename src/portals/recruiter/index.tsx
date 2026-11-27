import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole, SignedOutOnly } from '@/shared/auth/session';
import { ForgotPasswordPage } from '@/shared/passwordReset/ForgotPasswordPage';
import { ResetPasswordPage } from '@/shared/passwordReset/ResetPasswordPage';
import { RecruiterLayout } from './components/RecruiterLayout';
import { RECRUITER_PATH } from './constant';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyCandidatesPage } from './pages/MyCandidatesPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { RegisterPartnerPage } from './pages/RegisterPartnerPage';
import { SignUpPage } from './pages/SignUpPage';
import './recruiter.css';

const RecruiterPortal = () => (
  <Routes>
    <Route
      index
      element={
        <SignedOutOnly role={UserRole.Recruiter} to={RECRUITER_PATH.dashboard}>
          <HomePage />
        </SignedOutOnly>
      }
    />
    <Route
      path="login"
      element={
        <SignedOutOnly role={UserRole.Recruiter} to={RECRUITER_PATH.dashboard}>
          <LoginPage />
        </SignedOutOnly>
      }
    />
    <Route
      path="forgot-password"
      element={
        <SignedOutOnly role={UserRole.Recruiter} to={RECRUITER_PATH.dashboard}>
          <ForgotPasswordPage role={UserRole.Recruiter} />
        </SignedOutOnly>
      }
    />
    <Route path="reset-password" element={<ResetPasswordPage role={UserRole.Recruiter} />} />
    <Route
      path="signup"
      element={
        <SignedOutOnly role={UserRole.Recruiter} to={RECRUITER_PATH.dashboard}>
          <SignUpPage />
        </SignedOutOnly>
      }
    />
    <Route
      element={
        <RequireRole role={UserRole.Recruiter}>
          <RecruiterLayout />
        </RequireRole>
      }
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profiles" element={<ProfilesPage />} />
      <Route path="my-candidates" element={<MyCandidatesPage />} />
      <Route path="register-candidate" element={<RegisterPartnerPage />} />
      <Route path="candidates/:candidateId" element={<CandidateProfilePage />} />
      <Route path="*" element={<Navigate to={RECRUITER_PATH.dashboard} replace />} />
    </Route>
  </Routes>
);

export default RecruiterPortal;
