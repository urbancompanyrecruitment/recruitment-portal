import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR, QUERY_KEY } from '@/api/constant';
import { LOCK_NO_EXPIRY_LABEL, PARTNER_STATE_TAG, TERMS } from '@/domain/constant';
import { PartnerState, UserRole } from '@/domain/interface';
import { Sessions } from '@/shared/auth/interface';
import { CHANGE_PASSWORD } from '@/shared/components/constant';
import { REGISTRATION_COPY } from '@/shared/registration/constant';
import { RegistrationMode } from '@/shared/registration/interface';
import { RECRUITER_A_SESSION, RECRUITER_B_SESSION, RECRUITER_PENDING_SESSION } from '@/test/constant';
import {
  ACTIVE_LOCK,
  AGGREGATORS,
  ANA,
  CITIES,
  PENDING_RECRUITER,
  PLACED_LOCK,
  RECRUITERS,
  REGISTERED_BY_ALEX,
  REGISTRATION_LOCK,
  SINGAPORE_CITIES,
  SITI,
  slotsFor,
  THANDAR,
  withoutContactDetails,
} from '@/test/fixtures';
import { ApiStub } from '@/test/interface';
import { renderWithProviders } from '@/test/renderWithProviders';
import { chooseFirstSlot, chooseOption, searchOption } from '@/test/select';
import { requestsTo, signedOut, stubApi } from '@/test/stubFetch';
import {
  NO_EXPIRY_LOCK,
  PENDING_APPROVAL,
  PLACEMENT_FINAL_NOTE,
  PLACEMENT_FORM,
  RECRUITER_HOME,
  RECRUITER_HOME_OPTIONS,
  RECRUITER_LOGIN,
  RECRUITER_MESSAGE,
  RECRUITER_PATH,
  RECRUITER_SIGN_UP,
  REGISTER_PARTNER,
  REGISTERED_PARTNERS,
} from './constant';
import RecruiterPortal from './index';

const AVAILABLE = [withoutContactDetails(THANDAR), withoutContactDetails(SITI)];

const MY_LOCKS = [
  { lock: ACTIVE_LOCK, partner: withoutContactDetails(THANDAR) },
  { lock: PLACED_LOCK, partner: withoutContactDetails(ANA) },
];

const BASE_STUBS: ApiStub[] = [
  { path: '/recruiter/partners/available', body: AVAILABLE },
  { path: '/recruiter/partners/registered', body: [REGISTERED_BY_ALEX] },
  { path: '/recruiter/locks', body: MY_LOCKS },
  { path: '/recruiter/aggregators', body: AGGREGATORS },
  { path: '/partner/interview-cities', body: CITIES },
  { path: '/partner/interview-cities?country=Singapore', body: SINGAPORE_CITIES },
  { path: '/partner/interview-slots', body: slotsFor('tampines') },
];

const WITHOUT_AGGREGATORS: ApiStub[] = [
  ...BASE_STUBS.filter(stub => stub.path !== '/recruiter/aggregators'),
  { path: '/recruiter/aggregators', body: [] },
];

const RECRUITER_COPY = REGISTRATION_COPY[RegistrationMode.Recruiter];

const chooseAggregator = async (name: string) => {
  fireEvent.mouseDown(await screen.findByLabelText(PLACEMENT_FORM.aggregatorLabel));

  fireEvent.click(await screen.findByTitle(name));
};

const renderPortal = (route: string, sessions: Sessions = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/recruiter/*" element={<RecruiterPortal />} />
    </Routes>,
    { route, sessions },
  );

describe('Recruiter portal', () => {
  it('opens the recruiter dashboard entry with a create-account and a sign-in option when signed out', async () => {
    stubApi([signedOut(UserRole.Recruiter)]);
    renderPortal('/recruiter');

    expect(await screen.findByRole('heading', { name: RECRUITER_HOME.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: RECRUITER_HOME_OPTIONS[0].action })).toHaveAttribute('href', RECRUITER_PATH.signUp);
    expect(screen.getByRole('link', { name: RECRUITER_HOME_OPTIONS[1].action })).toHaveAttribute('href', RECRUITER_PATH.login);
  });

  it('redirects to the login page when a recruiter feature is opened without a session', async () => {
    stubApi([signedOut(UserRole.Recruiter)]);
    renderPortal('/recruiter/profiles');

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('The right people. The next opportunity.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: RECRUITER_LOGIN.signUpLink })).toHaveAttribute('href', RECRUITER_PATH.signUp);
  });

  it('links the recruiter terms and conditions PDF from the account request form', async () => {
    stubApi([signedOut(UserRole.Recruiter)]);
    renderPortal('/recruiter/signup');

    const link = await screen.findByRole('link', { name: TERMS.label });

    expect(link).toHaveAttribute('href', TERMS.recruiterPdf);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('requests an account with name, organisation, email and password, then shows only the waiting-for-approval message', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      signedOut(UserRole.Recruiter),
      { method: 'POST', path: '/recruiter/sign-up', status: 201, body: PENDING_RECRUITER },
    ]);
    renderPortal(RECRUITER_PATH.signUp);

    await userEvent.type(await screen.findByLabelText('Your name'), 'Priya Nair');
    await userEvent.type(screen.getByLabelText('Organisation'), 'SwiftStaff Agency');
    await userEvent.type(screen.getByLabelText('Email'), 'Priya.Nair@SwiftStaff.sg');
    await userEvent.type(screen.getByLabelText('Password'), 'Recruiter123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'Recruiter123');
    await userEvent.click(screen.getByRole('button', { name: RECRUITER_SIGN_UP.submit }));

    expect(await screen.findByText(RECRUITER_SIGN_UP.mismatch)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/recruiter/sign-up')).toHaveLength(0);

    await userEvent.type(screen.getByLabelText('Confirm password'), '!');
    await userEvent.click(screen.getByRole('button', { name: RECRUITER_SIGN_UP.submit }));

    expect(await screen.findByText(PENDING_APPROVAL.message)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/recruiter/sign-up')[0]).toEqual({
      name: 'Priya Nair',
      company: 'SwiftStaff Agency',
      email: 'priya.nair@swiftstaff.sg',
      password: 'Recruiter123!',
    });
    expect(screen.queryByText('Available profiles')).not.toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
    expect(requestsTo(fetchMock, 'GET', '/recruiter/partners/available')).toHaveLength(0);
    expect(requestsTo(fetchMock, 'GET', '/recruiter/locks')).toHaveLength(0);
    expect(requestsTo(fetchMock, 'GET', '/recruiter/aggregators')).toHaveLength(0);
  }, 20000);

  it('shows the backend error when the email already has an account', async () => {
    stubApi([
      signedOut(UserRole.Recruiter),
      { method: 'POST', path: '/recruiter/sign-up', status: 409, body: { error: { code: 'EMAIL_ALREADY_REGISTERED' } } },
    ]);
    renderPortal(RECRUITER_PATH.signUp);

    await userEvent.type(await screen.findByLabelText('Your name'), 'Priya Nair');
    await userEvent.type(screen.getByLabelText('Organisation'), 'SwiftStaff Agency');
    await userEvent.type(screen.getByLabelText('Email'), 'priya.nair@swiftstaff.sg');
    await userEvent.type(screen.getByLabelText('Password'), 'Recruiter123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'Recruiter123!');
    await userEvent.click(screen.getByRole('button', { name: RECRUITER_SIGN_UP.submit }));

    expect(await screen.findByText(API_ERROR.duplicateEmail)).toBeInTheDocument();
    expect(screen.queryByText(PENDING_APPROVAL.message)).not.toBeInTheDocument();
  }, 20000);

  it('keeps a recruiter who is not approved yet out of every feature page, then lets them in once approved', async () => {
    const fetchMock = stubApi([...BASE_STUBS, { path: '/recruiter/auth/me', body: RECRUITERS[0] }]);
    const pages = [
      '/recruiter/dashboard',
      '/recruiter/profiles',
      '/recruiter/my-candidates',
      RECRUITER_PATH.registerPartner,
      `/recruiter/candidates/${THANDAR.id}`,
    ];

    pages.forEach(route => {
      const view = renderPortal(route, { recruiter: RECRUITER_PENDING_SESSION });

      expect(screen.getByText(PENDING_APPROVAL.message)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: PENDING_APPROVAL.signOut })).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      view.unmount();
    });

    expect(fetchMock).not.toHaveBeenCalled();

    const { queryClient } = renderPortal('/recruiter/profiles', { recruiter: RECRUITER_PENDING_SESSION });

    await act(() => queryClient.invalidateQueries({ queryKey: QUERY_KEY.currentUser(UserRole.Recruiter) }));

    expect(await screen.findByText('2 available professionals')).toBeInTheDocument();
    expect(screen.queryByText(PENDING_APPROVAL.message)).not.toBeInTheDocument();
  });

  it('explains why a suspended or rejected recruiter cannot sign in', async () => {
    stubApi([
      signedOut(UserRole.Recruiter),
      { method: 'POST', path: '/recruiter/auth/login', status: 403, body: { error: { code: 'RECRUITER_REJECTED' } } },
    ]);
    renderPortal(RECRUITER_PATH.login);

    await userEvent.type(await screen.findByLabelText('Email'), 'sam@agency.sg');
    await userEvent.type(screen.getByLabelText('Password'), 'Recruiter123!');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/ }));

    expect(await screen.findByText(API_ERROR.recruiterRejected)).toBeInTheDocument();
  });

  it('signs in with email and password', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      signedOut(UserRole.Recruiter),
      { method: 'POST', path: '/recruiter/auth/login', body: RECRUITERS[0] },
    ]);
    renderPortal('/recruiter/login');

    await userEvent.type(await screen.findByLabelText('Email'), 'alex.morgan@brightpath.sg');
    await userEvent.type(screen.getByLabelText('Password'), 'Recruiter123!');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/ }));

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/recruiter/auth/login')[0]).toEqual({ email: 'alex.morgan@brightpath.sg', password: 'Recruiter123!' });
  });

  it('offers no ready-made accounts on the sign-in page', async () => {
    stubApi([signedOut(UserRole.Recruiter)]);
    renderPortal('/recruiter/login');

    expect(await screen.findByText(RECRUITER_LOGIN.accountNote)).toBeInTheDocument();
    expect(screen.queryByText(/seeded|demo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Recruiter/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('opens the dashboard for a signed-in recruiter from the sign-in page and from unknown paths', async () => {
    stubApi(BASE_STUBS);
    const first = renderPortal('/recruiter/login', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();

    first.unmount();
    renderPortal('/recruiter/unknown-page', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();
  });

  it('shows the recruiter the server reports when the cookie now belongs to another account', async () => {
    stubApi([...BASE_STUBS, { path: '/recruiter/auth/me', body: RECRUITERS[1] }]);
    const { queryClient } = renderPortal('/recruiter/dashboard', { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Hello, Alex')).toBeInTheDocument();

    await act(() => queryClient.invalidateQueries({ queryKey: QUERY_KEY.currentUser(UserRole.Recruiter) }));

    expect(await screen.findByText('Hello, Jamie')).toBeInTheDocument();
    expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
    expect(screen.getByText(/jamie\.lee@horizon\.sg/)).toBeInTheDocument();
    expect(screen.queryByText('Alex Morgan')).not.toBeInTheDocument();
  });

  it('lets a recruiter change their password from the header', async () => {
    const fetchMock = stubApi([...BASE_STUBS, { method: 'POST', path: '/recruiter/change-password', status: 204 }]);
    renderPortal('/recruiter/dashboard', { recruiter: RECRUITER_A_SESSION });

    await userEvent.click(await screen.findByRole('button', { name: CHANGE_PASSWORD.button }));
    await userEvent.type(await screen.findByLabelText(CHANGE_PASSWORD.currentLabel), 'Temp-Pass-123');
    await userEvent.type(screen.getByLabelText(CHANGE_PASSWORD.newLabel), 'Recruiter123!');
    await userEvent.type(screen.getByLabelText(CHANGE_PASSWORD.confirmLabel), 'Recruiter123!');
    await userEvent.click(screen.getByRole('button', { name: CHANGE_PASSWORD.submit }));

    expect(await screen.findByText(CHANGE_PASSWORD.success)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/recruiter/change-password')[0]).toEqual({ currentPassword: 'Temp-Pass-123', newPassword: 'Recruiter123!' });
  }, 20000);

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

  it('saves the chosen aggregator and the start date as the placement', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { path: `/recruiter/partners/${THANDAR.id}`, body: { lock: ACTIVE_LOCK, partner: THANDAR } },
      {
        method: 'POST',
        path: `/recruiter/partners/${THANDAR.id}/placement`,
        body: { ...ACTIVE_LOCK, state: 'inactive', inactiveReason: 'placed', employerName: AGGREGATORS[0].name, aggregatorId: AGGREGATORS[0].id, startDate: '2030-01-10' },
      },
    ]);
    renderPortal(`/recruiter/candidates/${THANDAR.id}`, { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('Locked exclusively for your account')).toBeInTheDocument();
    expect(screen.getByText(/The lock lasts 3 days/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Employer')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Save placement/ }));
    expect(await screen.findByText(PLACEMENT_FORM.aggregatorError)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/recruiter/partners/${THANDAR.id}/placement`)).toHaveLength(0);

    await chooseAggregator(AGGREGATORS[0].name);
    await userEvent.type(screen.getByLabelText('Planned joining / start date'), '10 Jan 2030{enter}');
    await userEvent.click(screen.getByRole('button', { name: /Save placement/ }));

    expect((await screen.findAllByText(RECRUITER_MESSAGE.placementSaved)).length).toBeGreaterThan(0);
    expect(requestsTo(fetchMock, 'POST', `/recruiter/partners/${THANDAR.id}/placement`)[0]).toEqual({ startDate: '2030-01-10', aggregatorId: AGGREGATORS[0].id });
  }, 20000);

  it('cannot save a placement until the Urban Company team has added an aggregator to the account', async () => {
    stubApi([...WITHOUT_AGGREGATORS, { path: `/recruiter/partners/${THANDAR.id}`, body: { lock: ACTIVE_LOCK, partner: THANDAR } }]);
    renderPortal(`/recruiter/candidates/${THANDAR.id}`, { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText(PLACEMENT_FORM.noAggregators)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save placement/ })).toBeDisabled();
    expect(screen.getByLabelText(PLACEMENT_FORM.aggregatorLabel)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Release lock' })).toBeEnabled();
  });

  it('shows a partner the recruiter registered as locked with no expiry', async () => {
    stubApi([
      ...BASE_STUBS.filter(stub => stub.path !== '/recruiter/locks'),
      { path: '/recruiter/locks', body: [{ lock: REGISTRATION_LOCK, partner: withoutContactDetails(SITI) }] },
      { path: `/recruiter/partners/${SITI.id}`, body: { lock: REGISTRATION_LOCK, partner: SITI } },
    ]);
    const profile = renderPortal(`/recruiter/candidates/${SITI.id}`, { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText(NO_EXPIRY_LOCK.title)).toBeInTheDocument();
    expect(screen.getByText(NO_EXPIRY_LOCK.note)).toBeInTheDocument();
    expect(screen.queryByText(/Save the placement by/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save placement/ })).toBeEnabled();

    profile.unmount();
    renderPortal('/recruiter/my-candidates', { recruiter: RECRUITER_A_SESSION });

    const row = (await screen.findByText('Siti Rahma')).closest('tr') as HTMLElement;
    expect(within(row).getByText(LOCK_NO_EXPIRY_LABEL)).toBeInTheDocument();
  });

  it('registers a partner on their behalf with the same form, without a source question', async () => {
    const registered = { ...REGISTERED_BY_ALEX, name: 'Test Partner', primaryPhone: '+6598765432' };
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/recruiter/partners', status: 201, body: { partner: registered, slot: slotsFor('tampines')[0] } },
    ]);
    renderPortal(RECRUITER_PATH.registerPartner, { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByRole('heading', { name: REGISTER_PARTNER.title })).toBeInTheDocument();
    expect(screen.getByText(REGISTER_PARTNER.note)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register a partner' })).toHaveAttribute('href', RECRUITER_PATH.registerPartner);
    expect(screen.queryByLabelText('Where did you hear about us?')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('First name'), 'Test');
    await userEvent.type(screen.getByLabelText('Last name'), 'Partner');
    await userEvent.type(screen.getByLabelText('Primary mobile number'), '+65 9876 5432');
    await chooseOption('Current country', 'Singapore');
    await userEvent.type(screen.getByLabelText('Current city'), 'Singapore');
    await searchOption('Nationality', 'Myanmar');
    await userEvent.type(screen.getByLabelText('Age'), '29');
    fireEvent.click(screen.getAllByRole('radio', { name: 'Yes' })[0]);
    fireEvent.click(screen.getAllByRole('radio', { name: 'No' })[1]);
    await chooseOption(RECRUITER_COPY.cookingLabel, 'Daily');
    await chooseOption('Interview city', 'Tampines, Singapore');
    await chooseFirstSlot();
    await userEvent.click(screen.getByRole('checkbox', { name: /The partner consents/ }));
    await userEvent.click(screen.getByRole('button', { name: RECRUITER_COPY.submit }));

    expect(await screen.findByText(REGISTER_PARTNER.successTitle('Test Partner'))).toBeInTheDocument();
    expect(screen.getByText('+6598765432')).toBeInTheDocument();

    const [body] = requestsTo(fetchMock, 'POST', '/recruiter/partners');
    expect(body).toMatchObject({
      firstName: 'Test',
      lastName: 'Partner',
      primaryPhone: '+65 9876 5432',
      country: 'Singapore',
      cookingFrequency: 'daily',
      consent: true,
      interviewCity: 'tampines',
      slotId: slotsFor('tampines')[0].id,
    });
    expect(body).not.toHaveProperty('source');
    expect(body).not.toHaveProperty('referrer');

    await userEvent.click(screen.getByRole('button', { name: REGISTER_PARTNER.registerAnother }));
    expect(await screen.findByLabelText('First name')).toHaveValue('');
  }, 30000);

  it('lists the partners the recruiter registered, with their slot and status', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/recruiter/my-candidates', { recruiter: RECRUITER_A_SESSION });

    const card = (await screen.findByText(`${REGISTERED_PARTNERS.title} (1)`)).closest('.ant-card') as HTMLElement;
    const row = (await within(card).findByText(REGISTERED_BY_ALEX.name)).closest('tr') as HTMLElement;
    expect(within(row).getByText(REGISTERED_BY_ALEX.primaryPhone!)).toBeInTheDocument();
    expect(within(row).getByText(PARTNER_STATE_TAG[PartnerState.SignedUp].label)).toBeInTheDocument();
    expect(within(row).getByText(/Asia\/Singapore/)).toBeInTheDocument();
    expect(within(card).getByText(REGISTERED_PARTNERS.note)).toBeInTheDocument();
  });

  it('shows a saved placement read-only', async () => {
    stubApi([...BASE_STUBS, { path: `/recruiter/partners/${ANA.id}`, body: { lock: PLACED_LOCK, partner: ANA } }]);
    renderPortal(`/recruiter/candidates/${ANA.id}`, { recruiter: RECRUITER_A_SESSION });

    expect(await screen.findByText('HomeCare Collective')).toBeInTheDocument();
    expect(screen.getByText(PLACEMENT_FINAL_NOTE)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /placement/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Release lock' })).not.toBeInTheDocument();
  });

  it('tells the recruiter when the lock expired before the placement was saved', async () => {
    stubApi([
      ...BASE_STUBS,
      { path: `/recruiter/partners/${THANDAR.id}`, body: { lock: ACTIVE_LOCK, partner: THANDAR } },
      { method: 'POST', path: `/recruiter/partners/${THANDAR.id}/placement`, status: 409, body: { error: { code: 'LOCK_EXPIRED' } } },
    ]);
    renderPortal(`/recruiter/candidates/${THANDAR.id}`, { recruiter: RECRUITER_A_SESSION });

    await chooseAggregator(AGGREGATORS[1].name);
    await userEvent.type(screen.getByLabelText('Planned joining / start date'), '10 Jan 2030{enter}');
    await userEvent.click(screen.getByRole('button', { name: /Save placement/ }));

    expect((await screen.findAllByText(API_ERROR.lockExpired)).length).toBeGreaterThan(0);
  }, 20000);
});
