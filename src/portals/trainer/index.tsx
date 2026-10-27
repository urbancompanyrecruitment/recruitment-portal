import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { RequireRole } from '@/shared/auth/AuthProvider';
import { PortalShell } from '@/shared/components/PortalShell';
import { StaffLogin } from '@/shared/components/StaffLogin';
import { DEMO_ACCOUNTS, LOGIN_COPY, NAV_ITEMS, SIDEBAR_FOOTER, TRAINER_PATH, WORKSPACE } from './constant';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { SchedulePage } from './pages/SchedulePage';
import './trainer.css';

const TrainerPortal = () => (
  <Routes>
    <Route
      path="login"
      element={
        <StaffLogin
          role={UserRole.Trainer}
          title={LOGIN_COPY.title}
          subtitle={LOGIN_COPY.subtitle}
          demoAccounts={DEMO_ACCOUNTS}
        />
      }
    />
    <Route
      element={
        <RequireRole role={UserRole.Trainer}>
          <PortalShell
            role={UserRole.Trainer}
            workspace={WORKSPACE}
            navItems={NAV_ITEMS}
            sidebarFooter={SIDEBAR_FOOTER}
          />
        </RequireRole>
      }
    >
      <Route index element={<Navigate to="candidates" replace />} />
      <Route path="candidates" element={<CandidatesPage />} />
      <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
      <Route path="schedule" element={<SchedulePage />} />
      <Route path="*" element={<Navigate to={TRAINER_PATH.candidates} replace />} />
    </Route>
  </Routes>
);

export default TrainerPortal;
