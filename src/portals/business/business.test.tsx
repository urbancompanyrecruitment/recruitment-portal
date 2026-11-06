import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { AUTH_ENDPOINT, TOKEN_COOKIE } from '@/api/constant';
import { environment } from '@/config';
import { UserRole } from '@/domain/interface';
import { readDb } from '@/mocks/db';
import { readCookie, writeCookie } from '@/shared/utils/cookie';
import { BUSINESS_SESSION, BUSINESS_TOKEN, DASHBOARD_USER_RESPONSE } from '@/test/constant';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetch } from '@/test/stubFetch';
import { BUSINESS_LOGIN, BUSINESS_MESSAGE, IMPORT_OUTCOME_LABEL } from './constant';
import BusinessPortal from './index';
import { ImportRowOutcome } from '@/domain/interface';

const renderPortal = (route: string, signedIn = true) =>
  renderWithProviders(
    <Routes>
      <Route path="/business/*" element={<BusinessPortal />} />
    </Routes>,
    { route, sessions: signedIn ? { [UserRole.Business]: BUSINESS_SESSION } : {} },
  );

describe('Business portal', () => {
  it('shows the Google sign-in page without a session', async () => {
    renderPortal('/business/overview', false);

    expect(await screen.findByText(BUSINESS_LOGIN.title)).toBeInTheDocument();
    expect(screen.getByText(BUSINESS_LOGIN.note)).toBeInTheDocument();
  });

  it('restores the business session from the dashboard token cookie', async () => {
    writeCookie(TOKEN_COOKIE, BUSINESS_TOKEN, 60);
    const fetchMock = stubFetch([{ body: { isError: false, success: { data: DASHBOARD_USER_RESPONSE } } }]);

    renderPortal('/business/overview', false);

    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${environment.sherlockApiUrl}${AUTH_ENDPOINT.currentUser}`);
    expect(init.headers.Authorization).toBe(`Bearer ${BUSINESS_TOKEN}`);
    expect(screen.getByText(DASHBOARD_USER_RESPONSE.email)).toBeInTheDocument();
  });

  it('clears an expired token and returns to sign-in', async () => {
    writeCookie(TOKEN_COOKIE, 'stale-token', 60);
    stubFetch([{ status: 401, body: { isError: true } }]);

    renderPortal('/business/overview', false);

    expect(await screen.findByText(BUSINESS_LOGIN.title)).toBeInTheDocument();
    expect(readCookie(TOKEN_COOKIE)).toBeUndefined();
  });

  it('shows total signups and lists seeded partners with their numbers', async () => {
    renderPortal('/business');

    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();
    const totalTile = screen.getByText('Total signups').closest('.stat-tile') as HTMLElement;
    await waitFor(() => expect(within(totalTile).getByText('15')).toBeInTheDocument());

    const row = (await screen.findByText('Lin Lin Htet')).closest('tr') as HTMLElement;
    expect(within(row).getAllByText('+65 9000 0012')).toHaveLength(2);
    expect(within(row).getByText('Lead created')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
  });

  it('adds a Singapore number and creates the onboarding lead', async () => {
    const user = userEvent.setup();
    renderPortal('/business/overview');

    await user.click(await screen.findByRole('button', { name: 'Add Singapore number for Mira Santos' }));
    await user.type(await screen.findByLabelText('Singapore mobile number'), '+65 9123 4567');
    await user.click(screen.getByRole('button', { name: 'Save number' }));

    expect(await screen.findByText(BUSINESS_MESSAGE.singaporePhoneSaved)).toBeInTheDocument();
    const row = (await screen.findByText('Mira Santos')).closest('tr') as HTMLElement;
    await waitFor(() => expect(within(row).getByText('Lead created')).toBeInTheDocument());
    expect(readDb().candidates.find(candidate => candidate.id === 'c8')?.onboarding?.leadId).toMatch(/^lead-/);
  });

  it('uploads a verified list, approves eligible partners and offers a fail CSV', async () => {
    const user = userEvent.setup();
    renderPortal('/business/overview');

    await screen.findByRole('heading', { name: 'Business overview' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(
      input,
      new File(['primary_mobile\n+65 9000 0012\n+66 9000 0008\n'], 'verified.csv', { type: 'text/csv' }),
    );

    expect(await screen.findByText('1 verified and approved, 1 failed out of 2 rows.')).toBeInTheDocument();
    expect(screen.getByText(IMPORT_OUTCOME_LABEL[ImportRowOutcome.NoSingaporeNumber])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download fail CSV/ })).toBeInTheDocument();
    const approved = readDb().candidates.find(candidate => candidate.id === 'c12');
    expect(approved?.verified).toBe(true);
    expect(approved?.onboarding?.approvedAt).toBeTruthy();
  });

  it('suspends a recruiter and shows the suspended status', async () => {
    const user = userEvent.setup();
    renderPortal('/business/recruiters');

    await user.click(await screen.findByRole('button', { name: 'Suspend Jamie Lee' }));

    expect(await screen.findByText('Suspended')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Activate Jamie Lee' })).toBeInTheDocument();
  });

  it('lists upcoming generated slots per city', async () => {
    renderPortal('/business/overview');

    const card = (await screen.findByText('Upcoming interview slots')).closest('.ant-card') as HTMLElement;
    expect(await within(card).findAllByText('Tampines')).not.toHaveLength(0);
    expect(within(card).getAllByText(/\/ \d+$/).length).toBeGreaterThan(0);
  });

  it('shows lock records with their state and the released profiles', async () => {
    renderPortal('/business/placements');

    const locks = (await screen.findByText('Recruiter locks')).closest('.ant-card') as HTMLElement;
    const nweRow = (await within(locks).findByText('Nwe Nwe Yi')).closest('tr') as HTMLElement;
    expect(within(nweRow).getByText('Active')).toBeInTheDocument();
    const anaRow = within(locks).getByText('Ana Reyes').closest('tr') as HTMLElement;
    expect(within(anaRow).getByText('Inactive')).toBeInTheDocument();
    expect(within(anaRow).getByText('Placement saved')).toBeInTheDocument();
    const released = screen.getByText('Released profiles').closest('.ant-card') as HTMLElement;
    expect(await within(released).findByText('Hnin Wai')).toBeInTheDocument();
    expect(screen.getByText('Tampines · East cluster')).toBeInTheDocument();
  });

  it('saves an edited hub from the placements modal', async () => {
    const user = userEvent.setup();
    renderPortal('/business/placements');

    await user.click(await screen.findByText('Edit hub'));
    const hubInput = await screen.findByLabelText('Hub / area');
    expect(hubInput).toHaveValue('Tampines · East cluster');

    await user.clear(hubInput);
    await user.type(hubInput, 'Bedok · East cluster');
    await user.click(screen.getByText('Save hub'));

    expect(await screen.findByText(BUSINESS_MESSAGE.hubSaved)).toBeInTheDocument();
    expect(await screen.findByText('Bedok · East cluster')).toBeInTheDocument();
  });
});
