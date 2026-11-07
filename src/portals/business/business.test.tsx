import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ImportRowOutcome, UserRole } from '@/domain/interface';
import { BUSINESS_SESSION } from '@/test/constant';
import { ADMIN_LOCKS, ADMIN_PROFILE, CANDIDATES, CITIES, LIN, MIRA, RECRUITERS } from '@/test/fixtures';
import { ApiStub } from '@/test/interface';
import { renderWithProviders } from '@/test/renderWithProviders';
import { requestsTo, stubApi } from '@/test/stubFetch';
import { BUSINESS_LOGIN, BUSINESS_MESSAGE, IMPORT_OUTCOME_LABEL } from './constant';
import BusinessPortal from './index';

const BASE_STUBS: ApiStub[] = [
  { path: '/admin/partners', body: CANDIDATES },
  { path: '/partner/interview-cities', body: CITIES },
  { path: '/admin/slot-occupancy', body: [{ date: '2026-11-08', cityKey: 'tampines', slots: 10, booked: 2, capacity: 40 }] },
  { path: '/admin/recruiters', body: RECRUITERS },
  { path: '/admin/locks', body: ADMIN_LOCKS },
];

const renderPortal = (route: string, signedIn = true) =>
  renderWithProviders(
    <Routes>
      <Route path="/business/*" element={<BusinessPortal />} />
    </Routes>,
    { route, sessions: signedIn ? { [UserRole.Business]: BUSINESS_SESSION } : {} },
  );

describe('Business portal', () => {
  it('shows the Google sign-in page without a session', async () => {
    stubApi([{ path: '/admin/auth/me', status: 401, body: { error: { code: 'UNAUTHORIZED' } } }]);
    renderPortal('/business/overview', false);

    expect(await screen.findByText(BUSINESS_LOGIN.title)).toBeInTheDocument();
    expect(screen.getByText(BUSINESS_LOGIN.note)).toBeInTheDocument();
  });

  it('restores the admin session from the session cookie', async () => {
    stubApi([...BASE_STUBS, { path: '/admin/auth/me', body: ADMIN_PROFILE }]);
    renderPortal('/business/overview', false);

    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_PROFILE.email)).toBeInTheDocument();
  });

  it('shows total signups and lists partners with their numbers and recruiter', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/business');

    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();
    const totalTile = screen.getByText('Total signups').closest('.stat-tile') as HTMLElement;
    await waitFor(() => expect(within(totalTile).getByText(String(CANDIDATES.length))).toBeInTheDocument());

    const row = (await screen.findByText('Lin Lin Htet')).closest('tr') as HTMLElement;
    expect(within(row).getAllByText('+6590000012')).toHaveLength(2);
    expect(within(row).getByText('Lead created')).toBeInTheDocument();
    const thandar = screen.getByText('Thandar Aung').closest('tr') as HTMLElement;
    expect(within(thandar).getByText('Alex Morgan')).toBeInTheDocument();
  });

  it('adds a Singapore number through the admin endpoint', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/partners/${MIRA.id}/singapore-phone`, body: { ...MIRA, singaporePhone: '+6591234567', hasSingaporePhone: true } },
    ]);
    renderPortal('/business/overview');

    await userEvent.click(await screen.findByRole('button', { name: 'Add Singapore number for Mira Santos' }));
    await userEvent.type(await screen.findByLabelText('Singapore mobile number'), '+65 9123 4567');
    await userEvent.click(screen.getByRole('button', { name: 'Save number' }));

    expect(await screen.findByText(BUSINESS_MESSAGE.singaporePhoneSaved)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/partners/${MIRA.id}/singapore-phone`)[0]).toEqual({ singaporePhone: '+65 9123 4567' });
  });

  it('uploads a verified list, shows the counts and offers a fail CSV', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: '/admin/verification-imports',
        status: 201,
        body: {
          importId: 'imp-1',
          fileName: 'verified.csv',
          counts: { rows: 2, accepted: 1, failed: 1 },
          rows: [
            { rowNumber: 1, primaryPhone: '+65 9000 0012', outcome: ImportRowOutcome.Accepted, partnerId: LIN.id },
            { rowNumber: 2, primaryPhone: '+66 9000 0008', outcome: ImportRowOutcome.NoSingaporeNumber, partnerId: MIRA.id },
          ],
        },
      },
    ]);
    renderPortal('/business/overview');

    await screen.findByRole('heading', { name: 'Business overview' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(['primary_mobile\n+65 9000 0012\n+66 9000 0008\n'], 'verified.csv', { type: 'text/csv' }),
    );

    expect(await screen.findByText('1 verified and approved, 1 failed out of 2 rows.')).toBeInTheDocument();
    expect(screen.getByText(IMPORT_OUTCOME_LABEL[ImportRowOutcome.NoSingaporeNumber])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download fail CSV/ })).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/verification-imports')[0]).toEqual({
      fileName: 'verified.csv',
      primaryPhones: ['+65 9000 0012', '+66 9000 0008'],
    });
  });

  it('creates a recruiter and shows the temporary password once', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/admin/recruiters', status: 201, body: { recruiter: { ...RECRUITERS[0], id: 'r-new', name: 'Sam Tan', email: 'sam@agency.sg', company: 'Agency' }, temporaryPassword: 'Temp-Pass-123' } },
    ]);
    renderPortal('/business/recruiters');

    await userEvent.type(await screen.findByLabelText('Name'), 'Sam Tan');
    await userEvent.type(screen.getByLabelText('Organisation'), 'Agency');
    await userEvent.type(screen.getByLabelText('Email'), 'Sam@agency.sg');
    await userEvent.click(screen.getByRole('button', { name: 'Create approved recruiter' }));

    expect(await screen.findByText('Temporary password for Sam Tan')).toBeInTheDocument();
    expect(screen.getByText('Temp-Pass-123')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/recruiters')[0]).toEqual({ name: 'Sam Tan', company: 'Agency', email: 'sam@agency.sg' });
  });

  it('suspends a recruiter through the status endpoint', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/recruiters/${RECRUITERS[1].id}/status`, body: { ...RECRUITERS[1], status: 'suspended', active: false } },
    ]);
    renderPortal('/business/recruiters');

    await userEvent.click(await screen.findByRole('button', { name: 'Suspend Jamie Lee' }));

    expect(await screen.findByText(BUSINESS_MESSAGE.recruiterAccessUpdated)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${RECRUITERS[1].id}/status`)[0]).toEqual({ status: 'suspended' });
  });

  it('lists upcoming generated slots per city', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/business/overview');

    const card = (await screen.findByText('Upcoming interview slots')).closest('.ant-card') as HTMLElement;
    expect(await within(card).findByText('Tampines')).toBeInTheDocument();
    expect(within(card).getByText('2 / 40')).toBeInTheDocument();
  });

  it('shows lock records with their state, employer and the released profiles', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/business/placements');

    const locks = (await screen.findByText('Recruiter locks')).closest('.ant-card') as HTMLElement;
    const thandarRow = (await within(locks).findByText('Thandar Aung')).closest('tr') as HTMLElement;
    expect(within(thandarRow).getByText('Active')).toBeInTheDocument();
    const anaRow = within(locks).getByText('Ana Reyes').closest('tr') as HTMLElement;
    expect(within(anaRow).getByText('Inactive')).toBeInTheDocument();
    expect(within(anaRow).getByText('Placement saved')).toBeInTheDocument();
    expect(within(anaRow).getByText('HomeCare Collective')).toBeInTheDocument();
    const released = screen.getByText('Released profiles').closest('.ant-card') as HTMLElement;
    expect(await within(released).findByText('Siti Rahma')).toBeInTheDocument();
    expect(within(released).getByText('Release time passed')).toBeInTheDocument();
  });
});
