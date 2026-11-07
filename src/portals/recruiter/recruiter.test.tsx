import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR } from '@/api/constant';
import { Sessions } from '@/shared/auth/interface';
import { RECRUITER_A_SESSION, RECRUITER_B_SESSION } from '@/test/constant';
import { ACTIVE_LOCK, ANA, PLACED_LOCK, SITI, THANDAR, withoutPhones } from '@/test/fixtures';
import { ApiStub } from '@/test/interface';
import { renderWithProviders } from '@/test/renderWithProviders';
import { requestsTo, stubApi } from '@/test/stubFetch';
import { RECRUITER_MESSAGE } from './constant';
import RecruiterPortal from './index';

const AVAILABLE = [withoutPhones(THANDAR), withoutPhones(SITI)];

const MY_LOCKS = [
  { lock: ACTIVE_LOCK, partner: withoutPhones(THANDAR) },
  { lock: PLACED_LOCK, partner: withoutPhones(ANA) },
];

const BASE_STUBS: ApiStub[] = [
  { path: '/recruiter/partners/available', body: AVAILABLE },
  { path: '/recruiter/locks', body: MY_LOCKS },
];

const renderPortal = (route: string, sessions: Sessions = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/recruiter/*" element={<RecruiterPortal />} />
    </Routes>,
    { route, sessions },
  );

describe('Recruiter portal', () => {
  it('redirects to the login page when there is no recruiter session', async () => {
    stubApi([{ path: '/recruiter/auth/me', status: 401, body: { error: { code: 'UNAUTHORIZED' } } }]);
    renderPortal('/recruiter/dashboard');

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('The right people. The next opportunity.')).toBeInTheDocument();
  });

  it('signs in with email and password', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/recruiter/auth/login', body: { id: RECRUITER_A_SESSION.id, name: 'Alex Morgan', email: 'alex.morgan@brightpath.sg', company: 'BrightPath Recruitment', status: 'active', active: true, createdAt: '2026-01-01T00:00:00.000Z' } },
    ]);
    renderPortal('/recruiter/login');

    await userEvent.click(await screen.findByRole('button', { name: /Recruiter A/ }));
    await userEvent.click(screen.getByRole('button', { name: /Sign in/ }));

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/recruiter/auth/login')[0]).toEqual({ email: 'alex.morgan@brightpath.sg', password: 'Demo123!' });
  });

  it('lists available profiles from the backend without phone numbers', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/recruiter/profiles', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
    expect(screen.getByText('2 available professionals')).toBeInTheDocument();
    expect(screen.queryByText('+6590000001')).not.toBeInTheDocument();
  });

  it('locks a candidate on "Open profile" and reveals the phone number', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: `/recruiter/partners/${THANDAR.id}/lock`, body: { lock: ACTIVE_LOCK, partner: THANDAR } },
      { path: `/recruiter/partners/${THANDAR.id}`, body: { lock: ACTIVE_LOCK, partner: THANDAR } },
    ]);
    renderPortal('/recruiter/profiles', { recruiter: RECRUITER_A_SESSION });

    const card = (await screen.findByText('Thandar Aung')).closest('.ant-card') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: /open profile/i }));

    const phone = await screen.findByRole('link', { name: '+6590000001' });
    expect(phone).toHaveAttribute('href', 'tel:+6590000001');
    expect(screen.getByText('Locked exclusively for your account')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/recruiter/partners/${THANDAR.id}/lock`)).toHaveLength(1);
  });

  it('hides a profile locked by another recruiter', async () => {
    stubApi([
      ...BASE_STUBS,
      { path: `/recruiter/partners/${ANA.id}`, status: 403, body: { error: { code: 'NOT_LOCK_OWNER' } } },
    ]);
    renderPortal(`/recruiter/candidates/${ANA.id}`, { recruiter: RECRUITER_B_SESSION });

    expect(await screen.findByText(API_ERROR.reservationNotFound)).toBeInTheDocument();
    expect(screen.getByText('Profile unavailable')).toBeInTheDocument();
    expect(screen.queryByText('+6590000005')).not.toBeInTheDocument();
  });

  it('shows the dashboard pipeline with locked and placed candidates', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/recruiter', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();
    expect(await screen.findByText('Placement not saved')).toBeInTheDocument();
    const awaiting = screen.getByText('Awaiting placement').closest('.stat-tile') as HTMLElement;
    expect(within(awaiting).getByText('1')).toBeInTheDocument();
    const placed = screen.getByText('Placed').closest('.stat-tile') as HTMLElement;
    expect(within(placed).getByText('1')).toBeInTheDocument();
  });

  it('filters my candidates by placement status', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/recruiter/my-candidates', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Ana Reyes')).toBeInTheDocument();
    expect(screen.getByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.getByText('HomeCare Collective')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Awaiting placement (1)' }));

    expect(screen.getByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.queryByText('Ana Reyes')).not.toBeInTheDocument();
  });

  it('saves the employer and start date as the placement', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { path: `/recruiter/partners/${THANDAR.id}`, body: { lock: ACTIVE_LOCK, partner: THANDAR } },
      { method: 'POST', path: `/recruiter/partners/${THANDAR.id}/placement`, body: { ...ACTIVE_LOCK, state: 'inactive', inactiveReason: 'placed', employerName: 'CleanSpace', startDate: '2030-01-10' } },
    ]);
    renderPortal(`/recruiter/candidates/${THANDAR.id}`, { recruiter: RECRUITER_A_SESSION });

    await userEvent.type(await screen.findByLabelText('Employer'), 'CleanSpace');
    await userEvent.type(screen.getByLabelText('Planned joining / start date'), '10 Jan 2030{enter}');
    await userEvent.click(screen.getByRole('button', { name: /Save placement/ }));

    expect((await screen.findAllByText(RECRUITER_MESSAGE.placementSaved)).length).toBeGreaterThan(0);
    expect(requestsTo(fetchMock, 'POST', `/recruiter/partners/${THANDAR.id}/placement`)[0]).toEqual({ startDate: '2030-01-10', employerName: 'CleanSpace' });
  }, 20000);
});
