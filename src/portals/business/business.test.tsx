import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { AUTH_ENDPOINT, TOKEN_COOKIE } from '@/api/constant';
import { environment } from '@/config';
import { UserRole } from '@/domain/interface';
import { readCookie, writeCookie } from '@/shared/utils/cookie';
import { BUSINESS_SESSION, BUSINESS_TOKEN, DASHBOARD_USER_RESPONSE } from '@/test/constant';
import { renderWithProviders } from '@/test/renderWithProviders';
import { stubFetch } from '@/test/stubFetch';
import { BUSINESS_LOGIN } from './constant';
import BusinessPortal from './index';

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

  it('shows total signups and lists seeded candidates in the tracker', async () => {
    renderPortal('/business');

    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();
    const totalTile = screen.getByText('Total signups').closest('.stat-tile') as HTMLElement;
    await waitFor(() => expect(within(totalTile).getByText('15')).toBeInTheDocument());

    expect(await screen.findByText('Lin Lin Htet')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
  });

  it('suspends a recruiter and shows the suspended status', async () => {
    const user = userEvent.setup();
    renderPortal('/business/recruiters');

    await user.click(await screen.findByRole('button', { name: 'Suspend Jamie Lee' }));

    expect(await screen.findByText('Suspended')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Activate Jamie Lee' })).toBeInTheDocument();
  });

  it('closes availability for a published session', async () => {
    const user = userEvent.setup();
    renderPortal('/business/trainers');

    expect(await screen.findByText('trainer.sg · Singapore')).toBeInTheDocument();
    const [firstSession] = await screen.findAllByRole('button', { name: 'Close availability' });
    await user.click(firstSession);

    expect(await screen.findByText('Reopen availability')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('lists released profiles and saved hubs on placements', async () => {
    renderPortal('/business/placements');

    const released = (await screen.findByText('Released profiles')).closest('.ant-card') as HTMLElement;
    expect(await within(released).findByText('Hnin Wai')).toBeInTheDocument();
    expect(await screen.findByText('Tampines · East cluster')).toBeInTheDocument();
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

    expect(await screen.findByText('Hub and joining date saved to the assigned recruiter profile.')).toBeInTheDocument();
    expect(await screen.findByText('Bedok · East cluster')).toBeInTheDocument();
  });
});
