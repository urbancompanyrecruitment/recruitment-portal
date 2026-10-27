import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR } from '@/api/constant';
import { Sessions } from '@/shared/auth/interface';
import { RECRUITER_A_SESSION, RECRUITER_B_SESSION } from '@/test/constant';
import { renderWithProviders } from '@/test/renderWithProviders';
import RecruiterPortal from './index';

const renderPortal = (route: string, sessions: Sessions = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/recruiter/*" element={<RecruiterPortal />} />
    </Routes>,
    { route, sessions },
  );

describe('Recruiter portal', () => {
  it('redirects to the login page when there is no recruiter session', async () => {
    renderPortal('/recruiter/dashboard');

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('The right people. The next opportunity.')).toBeInTheDocument();
  });

  it('lists only verified, unreserved candidates as available profiles', async () => {
    renderPortal('/recruiter/profiles', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
    expect(screen.getByText('3 available professionals')).toBeInTheDocument();
    expect(screen.queryByText('Ana Reyes')).not.toBeInTheDocument();
    expect(screen.queryByText('Aye Chan')).not.toBeInTheDocument();
    expect(screen.queryByText('Mira Santos')).not.toBeInTheDocument();
  });

  it('reserves a candidate on "Open profile" and reveals the phone number', async () => {
    const user = userEvent.setup();
    renderPortal('/recruiter/profiles', { recruiter: RECRUITER_A_SESSION });

    const card = (await screen.findByText('Thandar Aung')).closest('.ant-card') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: /open profile/i }));

    const phone = await screen.findByRole('link', { name: '+65 0000 0001' });
    expect(phone).toHaveAttribute('href', 'tel:+6500000001');
    expect(screen.getByText('Reserved exclusively for your account')).toBeInTheDocument();
  });

  it('hides a profile reserved by another recruiter', async () => {
    renderPortal('/recruiter/candidates/c5', { recruiter: RECRUITER_B_SESSION });

    expect(await screen.findByText(API_ERROR.reservationNotFound)).toBeInTheDocument();
    expect(screen.getByText('Profile unavailable')).toBeInTheDocument();
    expect(screen.queryByText('+65 0000 0005')).not.toBeInTheDocument();
  });

  it('shows the dashboard pipeline and releases unassigned reservations from demo controls', async () => {
    const user = userEvent.setup();
    renderPortal('/recruiter', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();
    expect(await screen.findByText('Nwe Nwe Yi')).toBeInTheDocument();
    expect(screen.getByText('Aggregator not assigned')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expire my unassigned reservations' }));

    expect(await screen.findByText(/Released 1 unassigned reservation/)).toBeInTheDocument();
    expect(await screen.findByText('You are up to date. No unassigned reservations.')).toBeInTheDocument();
  });

  it('filters my candidates by placement status', async () => {
    const user = userEvent.setup();
    renderPortal('/recruiter/my-candidates', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Ana Reyes')).toBeInTheDocument();
    expect(screen.getByText('May Thu')).toBeInTheDocument();
    expect(screen.getByText('Nwe Nwe Yi')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Awaiting aggregator (1)' }));

    expect(screen.getByText('Nwe Nwe Yi')).toBeInTheDocument();
    expect(screen.queryByText('Ana Reyes')).not.toBeInTheDocument();
    expect(screen.queryByText('May Thu')).not.toBeInTheDocument();
  });

  it('shows joining-soon placements with their hub status in notifications', async () => {
    renderPortal('/recruiter/notifications', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText(/Ana Reyes · Joining/)).toBeInTheDocument();
    expect(screen.getByText('Hub instructions available')).toBeInTheDocument();
    expect(screen.getByText(/UC has assigned Tampines · East cluster/)).toBeInTheDocument();
    expect(screen.queryByText(/May Thu · Joining/)).not.toBeInTheDocument();
  });
});
