import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR, QUERY_KEY } from '@/api/constant';
import { NATIONALITIES, TERMS } from '@/domain/constant';
import { formatDate } from '@/domain/format';
import { PartnerNotificationType, PartnerStage, UserRole } from '@/domain/interface';
import { Sessions } from '@/shared/auth/interface';
import { CHANGE_PASSWORD } from '@/shared/components/constant';
import {
  CHOOSE_CITY_MESSAGE,
  CONSENT_ERROR,
  INTERVIEW_CITY_HINT,
  PRIMARY_PHONE_ERROR,
  REGISTRATION_COPY,
  SINGAPORE_PHONE_ERROR,
} from '@/shared/registration/constant';
import { RegistrationMode } from '@/shared/registration/interface';
import { PARTNER_SESSION } from '@/test/constant';
import { ANA, CITIES, KHIN, LIN, MYANMAR_CITIES, NOTIFICATIONS, SINGAPORE_CITIES, slotsFor, THANDAR } from '@/test/fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';
import { chooseFirstSlot, chooseOption, findOption, findSlotButtons, openOptionTitles, openSelect, searchOption } from '@/test/select';
import { requestsTo, signedOut, stubApi } from '@/test/stubFetch';
import { ApiStub } from '@/test/interface';
import {
  NOTIFICATION_COPY,
  PARTNER_HEADER,
  PARTNER_HOME,
  PARTNER_LOGIN,
  PARTNER_NOTIFICATIONS,
  PARTNER_RESCHEDULE,
  PARTNER_ROUTE,
  PARTNER_STATUS,
  THANK_YOU,
} from './constant';
import PartnerPortal from '.';

const COPY = REGISTRATION_COPY[RegistrationMode.Partner];

const SUBMIT_REGISTRATION = COPY.submit;

const SUBMIT_LOGIN = /Sign in/;

const NO_NOTIFICATIONS = { notifications: [], unreadCount: 0 };

const PUBLIC_STUBS: ApiStub[] = [
  { path: '/partner/interview-cities', body: CITIES },
  { path: '/partner/interview-cities?country=Singapore', body: SINGAPORE_CITIES },
  { path: '/partner/interview-cities?country=Myanmar', body: MYANMAR_CITIES },
  { path: '/partner/interview-cities?country=Others', body: CITIES },
  { path: '/partner/interview-slots', body: slotsFor('tampines') },
];

const BASE_STUBS: ApiStub[] = [...PUBLIC_STUBS, signedOut(UserRole.Partner), { path: '/partner/notifications', body: NO_NOTIFICATIONS }];

const SIGNED_IN_STUBS: ApiStub[] = [
  ...PUBLIC_STUBS,
  { path: '/partner/auth/me', body: THANDAR },
  { path: '/partner/me', body: { partner: THANDAR, slot: undefined } },
  { path: '/partner/notifications', body: NO_NOTIFICATIONS },
];

const renderPartner = (route = PARTNER_ROUTE.registration, sessions: Sessions = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/partner/*" element={<PartnerPortal />} />
    </Routes>,
    { route, sessions },
  );

const fillDetails = async (primaryPhone: string) => {
  await userEvent.type(screen.getByLabelText('First name'), 'Test');
  await userEvent.type(screen.getByLabelText('Last name'), 'Partner');
  await userEvent.type(screen.getByLabelText('Primary mobile number'), primaryPhone);
  await chooseOption('Current country', 'Singapore');
  await userEvent.type(screen.getByLabelText('Current city'), 'Singapore');
  await searchOption('Nationality', 'Myanmar');
  await userEvent.type(screen.getByLabelText('Age'), '29');
  await chooseOption('Where did you hear about us?', 'TikTok');
  fireEvent.click(screen.getAllByRole('radio', { name: 'Yes' })[0]);
  fireEvent.click(screen.getAllByRole('radio', { name: 'No' })[1]);
  await chooseOption(COPY.cookingLabel, 'Daily');
  await chooseOption('Interview city', 'Tampines, Singapore');
  await chooseFirstSlot();
  await userEvent.click(screen.getByRole('checkbox', { name: /I consent/ }));
};

const signIn = async (primaryPhone: string, lastName: string) => {
  await userEvent.type(await screen.findByLabelText(PARTNER_LOGIN.phoneLabel), primaryPhone);
  await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.lastNameLabel), lastName);
  await userEvent.click(screen.getByRole('button', { name: SUBMIT_LOGIN }));
};

describe('partner portal', () => {
  it('opens the partner dashboard with a new registration and a sign-in option', async () => {
    stubApi(BASE_STUBS);
    renderPartner(PARTNER_ROUTE.home);

    expect(screen.getByText(PARTNER_HOME.title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: PARTNER_HOME.register.action })).toHaveAttribute('href', PARTNER_ROUTE.registration);
    expect(screen.getByRole('link', { name: PARTNER_HOME.login.action })).toHaveAttribute('href', PARTNER_ROUTE.login);
    expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).not.toContainEqual(expect.stringMatching(/^\/(recruiter|admin)/));

    await userEvent.click(screen.getByRole('link', { name: PARTNER_HOME.register.action }));
    expect(await screen.findByLabelText('Last name')).toBeInTheDocument();
  });

  it('offers Singapore, Myanmar and Others as the country and every country as the nationality', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    await openSelect('Current country');
    await findOption('Others');
    expect(openOptionTitles()).toEqual(['Singapore', 'Myanmar', 'Others']);

    await userEvent.type(screen.getByLabelText('Nationality'), 'Zimb');
    expect(await findOption('Zimbabwe')).toBeInTheDocument();
    expect(NATIONALITIES.length).toBeGreaterThan(190);
    expect(NATIONALITIES).toEqual(expect.arrayContaining(['Singapore', 'Myanmar', 'Philippines', 'Indonesia', 'India', 'Vietnam']));
  });

  it('lists the interview cities of the chosen country, and every city for Others', async () => {
    const fetchMock = stubApi(BASE_STUBS);
    renderPartner();

    expect(screen.getByLabelText('Interview city')).toBeDisabled();
    expect(screen.getByText(INTERVIEW_CITY_HINT.noCountry)).toBeInTheDocument();

    await chooseOption('Current country', 'Myanmar');
    expect(await screen.findByText(INTERVIEW_CITY_HINT.single)).toBeInTheDocument();

    await openSelect('Interview city');
    const yangon = await findOption('Yangon, Myanmar');
    expect(openOptionTitles()).not.toContain('Tampines, Singapore');
    fireEvent.click(yangon);
    await chooseFirstSlot();

    await chooseOption('Current country', 'Others');
    expect(await screen.findByText(INTERVIEW_CITY_HINT.others)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^\d{2}:00$/ })).not.toBeInTheDocument();

    await openSelect('Interview city');
    await findOption('Tampines, Singapore');
    expect(openOptionTitles()).toContain('Yangon, Myanmar');

    const requested = fetchMock.mock.calls.map(([input]) => String(input)).filter(url => url.includes('interview-cities'));
    expect(requested).toEqual([
      '/api/partner/interview-cities',
      '/api/partner/interview-cities?country=Myanmar',
      '/api/partner/interview-cities?country=Others',
    ]);
  });

  it('selects the interview centre by itself when the country has only one, so the partner only picks a time', async () => {
    stubApi([{ path: '/partner/interview-cities?country=Singapore', body: [{ ...SINGAPORE_CITIES[0], name: 'Singapore' }] }, ...BASE_STUBS]);
    renderPartner();

    await chooseOption('Current country', 'Singapore');

    expect(await screen.findByText(INTERVIEW_CITY_HINT.single)).toBeInTheDocument();
    expect((await findSlotButtons()).length).toBeGreaterThan(0);
    expect(screen.queryByText(CHOOSE_CITY_MESSAGE)).not.toBeInTheDocument();

    await chooseFirstSlot();

    expect(await screen.findByText(SINGAPORE_CITIES[0].centre)).toBeInTheDocument();
  });

  it('links the partner terms and conditions PDF from the registration form', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    const link = screen.getByRole('link', { name: TERMS.label });

    expect(link).toHaveAttribute('href', TERMS.partnerPdf);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(new RegExp(COPY.termsNote))).toBeInTheDocument();
  });

  it('shows hourly slots for the chosen city and the centre details', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    await chooseOption('Current country', 'Singapore');
    await chooseOption('Interview city', 'Tampines, Singapore');
    await chooseFirstSlot();

    expect(await screen.findByText('UC Tampines Centre', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText(/Tampines Central/)).toBeInTheDocument();
    expect(screen.getByText(/3 seats left/)).toBeInTheDocument();
  });

  it('asks for a first and last name but no email or password, and validates the numbers and consent', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByText(COPY.lastNameHint)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
    expect(screen.queryByText(/legal approval/i)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Primary mobile number'), '91234567');
    await userEvent.type(screen.getByLabelText('Singapore mobile number (optional)'), '+65 1234');
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_REGISTRATION }));

    expect(await screen.findByText(PRIMARY_PHONE_ERROR)).toBeInTheDocument();
    expect(await screen.findByText(SINGAPORE_PHONE_ERROR)).toBeInTheDocument();
    expect(await screen.findByText(CONSENT_ERROR)).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('registers with first and last name, sends booleans and keys, then signs in with the primary mobile and last name', async () => {
    const registered = { ...LIN, name: 'Test Partner', primaryPhone: '+6598765432', singaporePhone: '+6598765432' };
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/sign-up', status: 201, body: { partner: registered, slot: slotsFor('tampines')[0] } },
      { method: 'POST', path: '/partner/auth/login', body: registered },
      { path: '/partner/me', body: { partner: registered, slot: slotsFor('tampines')[0] } },
    ]);
    renderPartner();

    expect(screen.queryByText(COPY.copyPrimaryLabel)).not.toBeInTheDocument();
    await fillDetails('+65 9876 5432');
    await userEvent.click(screen.getByRole('checkbox', { name: COPY.copyPrimaryLabel }));
    expect(screen.getByLabelText('Singapore mobile number (optional)')).toHaveValue('+65 9876 5432');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_REGISTRATION }));

    expect(await screen.findByText(THANK_YOU.title)).toBeInTheDocument();
    expect(screen.getByText(THANK_YOU.onboardingNote)).toBeInTheDocument();
    expect(screen.getByText('UC Tampines Centre, Tampines')).toBeInTheDocument();

    const [body] = requestsTo(fetchMock, 'POST', '/partner/sign-up');
    expect(body).toMatchObject({
      firstName: 'Test',
      lastName: 'Partner',
      primaryPhone: '+65 9876 5432',
      singaporePhone: '+65 9876 5432',
      country: 'Singapore',
      nationality: 'Myanmar',
      source: 'tiktok',
      cookingFrequency: 'daily',
      comfortableWithDogs: true,
      deepCleaningExperience: false,
      consent: true,
      interviewCity: 'tampines',
      slotId: slotsFor('tampines')[0].id,
    });
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('name');

    await userEvent.click(screen.getByRole('button', { name: THANK_YOU.checkStatus }));
    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();

    await signIn('+65 9876 5432', ' Partner ');

    expect(await screen.findByText(PARTNER_STATUS.title)).toBeInTheDocument();
    expect(screen.getAllByText('Test Partner')).toHaveLength(2);
    expect(screen.getByText('UC Tampines Centre, Tampines')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CHANGE_PASSWORD.button })).not.toBeInTheDocument();

    const [loginBody] = requestsTo(fetchMock, 'POST', '/partner/auth/login');
    expect(loginBody).toEqual({ primaryPhone: '+65 9876 5432', lastName: 'Partner' });
  }, 30000);

  it('shows the backend error when the primary mobile is already registered', async () => {
    stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/sign-up', status: 409, body: { error: { code: 'PHONE_ALREADY_REGISTERED' } } },
    ]);
    renderPartner();

    await fillDetails('+95 9876 0000');
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_REGISTRATION }));

    expect(await screen.findByText(API_ERROR.duplicatePhone)).toBeInTheDocument();
    expect(screen.queryByText(THANK_YOU.title)).not.toBeInTheDocument();
  }, 20000);

  it('redirects anonymous visitors to login and shows a verified partner at the verified stage after sign-in', async () => {
    stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/auth/login', body: THANDAR },
      { path: '/partner/me', body: { partner: THANDAR, slot: undefined } },
    ]);
    renderPartner(PARTNER_ROUTE.status);

    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();

    await signIn(THANDAR.primaryPhone!, 'Aung');

    expect(await screen.findByText(PARTNER_STATUS.stages[1].title)).toBeInTheDocument();
    expect(screen.getAllByText('Thandar Aung')).toHaveLength(2);
    expect(screen.getByText(PARTNER_STATUS.stages[1].title).closest('.ant-steps-item')).toHaveClass('ant-steps-item-process');
    expect(screen.queryByRole('button', { name: PARTNER_RESCHEDULE.action })).not.toBeInTheDocument();
    expect(THANDAR.stage).toBe(PartnerStage.Verified);
  });

  it('tells a partner who failed verification that the application is closed', async () => {
    stubApi([
      ...PUBLIC_STUBS,
      { path: '/partner/auth/me', body: KHIN },
      { path: '/partner/me', body: { partner: KHIN, slot: undefined } },
      { path: '/partner/notifications', body: NO_NOTIFICATIONS },
    ]);
    renderPartner(PARTNER_ROUTE.status);

    expect(await screen.findByText(PARTNER_STATUS.failedNotice)).toBeInTheDocument();
    expect(screen.getByText(PARTNER_STATUS.failedStage.title).closest('.ant-steps-item')).toHaveClass('ant-steps-item-error');
    expect(screen.queryByText(PARTNER_STATUS.stages[1].title)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: PARTNER_RESCHEDULE.action })).not.toBeInTheDocument();
  });

  it('shows the hub the admin team assigned', async () => {
    stubApi([
      ...PUBLIC_STUBS,
      { path: '/partner/auth/me', body: ANA },
      { path: '/partner/me', body: { partner: ANA, slot: undefined } },
      { path: '/partner/notifications', body: NO_NOTIFICATIONS },
    ]);
    renderPartner(PARTNER_ROUTE.status);

    expect(await screen.findByText(PARTNER_STATUS.hubLabel)).toBeInTheDocument();
    expect(screen.getByText('Tampines East')).toBeInTheDocument();
  });

  it('checks the number format first, then shows the backend error for a wrong last name', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/auth/login', status: 401, body: { error: { code: 'INVALID_CREDENTIALS' } } },
    ]);
    renderPartner(PARTNER_ROUTE.login);

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

    await signIn('thandar.aung@example.com', 'Someone');

    expect(await screen.findByText(PRIMARY_PHONE_ERROR)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/partner/auth/login')).toHaveLength(0);

    await userEvent.clear(screen.getByLabelText(PARTNER_LOGIN.phoneLabel));
    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.phoneLabel), THANDAR.primaryPhone!);
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LOGIN }));

    expect(await screen.findByText(API_ERROR.invalidCredentials)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/partner/auth/login')[0]).toEqual({ primaryPhone: THANDAR.primaryPhone, lastName: 'Someone' });
  });

  it('restores the session from the cookie in a new tab and shows the status page, not the sign-in form', async () => {
    stubApi(SIGNED_IN_STUBS);
    renderPartner(PARTNER_ROUTE.status);

    expect(await screen.findByText(PARTNER_STATUS.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PARTNER_HEADER.signOut })).toBeInTheDocument();
    expect(screen.queryByText(PARTNER_LOGIN.title)).not.toBeInTheDocument();
  });

  it('sends an already signed-in partner from the sign-in page to their status', async () => {
    stubApi(SIGNED_IN_STUBS);
    renderPartner(PARTNER_ROUTE.login);

    expect(await screen.findByText(PARTNER_STATUS.title)).toBeInTheDocument();
    expect(screen.queryByText(PARTNER_LOGIN.title)).not.toBeInTheDocument();
  });

  it('returns to the sign-in page, signed out, when the session has ended', async () => {
    stubApi(BASE_STUBS.concat({ path: '/partner/me', body: { partner: THANDAR, slot: undefined } }));
    const { queryClient } = renderPartner(PARTNER_ROUTE.status, { [UserRole.Partner]: PARTNER_SESSION });

    expect(await screen.findByText(PARTNER_STATUS.title)).toBeInTheDocument();

    await act(() => queryClient.invalidateQueries({ queryKey: QUERY_KEY.currentUser(UserRole.Partner) }));

    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: PARTNER_HEADER.signOut })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: PARTNER_NOTIFICATIONS.label })).not.toBeInTheDocument();
  });

  it('shows no ready-made sign-in details on the sign-in page', async () => {
    stubApi(BASE_STUBS);
    renderPartner(PARTNER_ROUTE.login);

    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();
    expect(screen.queryByText(/seeded|demo/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(PARTNER_LOGIN.phoneLabel)).toHaveValue('');
    expect(screen.getByLabelText(PARTNER_LOGIN.lastNameLabel)).toHaveValue('');
  });

  it('lets a registered partner pick a new interview slot from the status page', async () => {
    const [bookedSlot, newSlot] = slotsFor('tampines');
    const fetchMock = stubApi([
      ...PUBLIC_STUBS,
      { path: '/partner/auth/me', body: LIN },
      { path: '/partner/me', body: { partner: LIN, slot: bookedSlot } },
      { path: '/partner/notifications', body: NO_NOTIFICATIONS },
      { method: 'POST', path: '/partner/reschedule', body: { partner: { ...LIN, slotId: newSlot.id }, slot: newSlot } },
    ]);
    renderPartner(PARTNER_ROUTE.status);

    await userEvent.click(await screen.findByRole('button', { name: PARTNER_RESCHEDULE.action }));

    expect(await screen.findByText(PARTNER_RESCHEDULE.title)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PARTNER_RESCHEDULE.submit }));
    expect(await screen.findByText('Choose an interview city')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/partner/reschedule')).toHaveLength(0);

    await chooseOption('Interview city', 'Tampines, Singapore');

    const slotButtons = await findSlotButtons();
    fireEvent.click(slotButtons[1]);

    await userEvent.click(screen.getByRole('button', { name: PARTNER_RESCHEDULE.submit }));

    expect((await screen.findAllByText(PARTNER_RESCHEDULE.success)).length).toBeGreaterThan(0);
    expect(requestsTo(fetchMock, 'POST', '/partner/reschedule')[0]).toEqual({ interviewCity: 'tampines', slotId: newSlot.id });
  }, 20000);

  it('shows the bell with the unread count, lists the notifications and marks them read when it closes', async () => {
    const fetchMock = stubApi([
      ...PUBLIC_STUBS,
      { path: '/partner/auth/me', body: ANA },
      { path: '/partner/me', body: { partner: ANA, slot: undefined } },
      { path: '/partner/notifications', body: { notifications: NOTIFICATIONS, unreadCount: 1 } },
      { method: 'POST', path: '/partner/notifications/read', status: 204 },
    ]);
    renderPartner(PARTNER_ROUTE.status);

    const bell = await screen.findByRole('button', { name: `${PARTNER_NOTIFICATIONS.label}, 1 unread` });
    expect(bell.closest('.public-header-leading')).not.toBeNull();

    await userEvent.click(bell);

    expect(await screen.findByText(NOTIFICATION_COPY[PartnerNotificationType.Verified].title)).toBeInTheDocument();
    expect(screen.getByText(NOTIFICATION_COPY[PartnerNotificationType.Placement].title)).toBeInTheDocument();
    expect(screen.getByText(`Aggregator: HomeCare Collective. Joining date: ${formatDate(NOTIFICATIONS[0].data?.startDate)}.`)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/partner/notifications/read')).toHaveLength(0);

    await userEvent.click(bell);

    await waitFor(() => expect(requestsTo(fetchMock, 'POST', '/partner/notifications/read')).toHaveLength(1));
  });

  it('shows an empty bell without a count when there is nothing to tell, and no bell to visitors', async () => {
    stubApi(SIGNED_IN_STUBS);
    const signedIn = renderPartner(PARTNER_ROUTE.status);

    await userEvent.click(await screen.findByRole('button', { name: PARTNER_NOTIFICATIONS.label }));
    expect(await screen.findByText(PARTNER_NOTIFICATIONS.empty)).toBeInTheDocument();

    signedIn.unmount();
    stubApi(BASE_STUBS);
    renderPartner(PARTNER_ROUTE.home);

    expect(screen.getByText(PARTNER_HOME.title)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: PARTNER_NOTIFICATIONS.label })).not.toBeInTheDocument();
  });

  it('sends unknown partner paths to the partner dashboard', () => {
    stubApi(BASE_STUBS);
    renderPartner('/partner/unknown');

    expect(screen.getByText(PARTNER_HOME.title)).toBeInTheDocument();
  });
});
