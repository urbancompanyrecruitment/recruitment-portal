import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole } from '@/shared/auth/AuthProvider';
import { RecruiterLayout } from './components/RecruiterLayout';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MyCandidatesPage } from './pages/MyCandidatesPage';
import { ProfilesPage } from './pages/ProfilesPage';
import './recruiter.css';

const RecruiterPortal = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />
    <Route
      element={
        <RequireRole role={UserRole.Recruiter}>
          <RecruiterLayout />
        </RequireRole>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profiles" element={<ProfilesPage />} />
      <Route path="my-candidates" element={<MyCandidatesPage />} />
      <Route path="candidates/:candidateId" element={<CandidateProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default RecruiterPortal;
