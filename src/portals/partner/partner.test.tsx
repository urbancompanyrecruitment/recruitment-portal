import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR } from '@/api/constant';
import { PartnerStage } from '@/domain/interface';
import { CITIES, LIN, slotsFor, THANDAR } from '@/test/fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';
import { requestsTo, stubApi } from '@/test/stubFetch';
import { ApiStub } from '@/test/interface';
import { CONFIRM_PASSWORD_ERROR, COPY_PRIMARY_LABEL, PARTNER_LOGIN, PARTNER_STATUS, SINGAPORE_PHONE_ERROR, THANK_YOU } from './constant';
import PartnerPortal from '.';

const PASSWORD = 'Partner123!';

const SUBMIT_LOGIN = /Sign in/;

const BASE_STUBS: ApiStub[] = [
  { path: '/partner/interview-cities', body: CITIES },
  { path: '/partner/interview-slots', body: slotsFor('tampines') },
];

const renderPartner = (route = '/partner') =>
  renderWithProviders(
    <Routes>
      <Route path="/partner/*" element={<PartnerPortal />} />
    </Routes>,
    { route },
  );

const chooseOption = async (label: string, option: string) => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const dropdowns = document.querySelectorAll<HTMLElement>('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  fireEvent.click(await within(dropdowns[dropdowns.length - 1]).findByTitle(option));
};

const chooseFirstSlot = async () => {
  const [firstSlot] = await screen.findAllByRole('radio', { name: /^\d{2}:00$/ });
  fireEvent.click(firstSlot);
};

const fillDetails = async (primaryPhone: string) => {
  await userEvent.type(screen.getByLabelText('Full name'), 'Test Partner');
  await userEvent.type(screen.getByLabelText('Primary mobile number'), primaryPhone);
  await userEvent.type(screen.getByLabelText('Password'), PASSWORD);
  await userEvent.type(screen.getByLabelText('Confirm password'), PASSWORD);
  await chooseOption('Current country', 'Singapore');
  await userEvent.type(screen.getByLabelText('Current city'), 'Singapore');
  await chooseOption('Nationality', 'Myanmar');
  await userEvent.type(screen.getByLabelText('Age'), '29');
  await chooseOption('Where did you hear about us?', 'TikTok');
  fireEvent.click(screen.getAllByRole('radio', { name: 'Yes' })[0]);
  fireEvent.click(screen.getAllByRole('radio', { name: 'No' })[1]);
  await chooseOption('How often did you cook in previous work?', 'Daily');
  await chooseOption('Interview city', 'Tampines');
  await chooseFirstSlot();
  await userEvent.click(screen.getByRole('checkbox', { name: /I consent/ }));
};

describe('partner portal', () => {
  it('shows hourly slots for the chosen city and the centre details', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    await chooseOption('Interview city', 'Tampines');
    await chooseFirstSlot();

    expect(await screen.findByText('UC Tampines Centre', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText(/Tampines Central/)).toBeInTheDocument();
    expect(screen.getByText(/3 seats left/)).toBeInTheDocument();
  });

  it('validates the primary number, the Singapore number, the password and consent', async () => {
    stubApi(BASE_STUBS);
    renderPartner();

    await userEvent.type(screen.getByLabelText('Primary mobile number'), '91234567');
    await userEvent.type(screen.getByLabelText('Singapore mobile number (optional)'), '+65 1234');
    await userEvent.type(screen.getByLabelText('Password'), PASSWORD);
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText('Use + and country code, e.g. +65 9123 4567')).toBeInTheDocument();
    expect(await screen.findByText(SINGAPORE_PHONE_ERROR)).toBeInTheDocument();
    expect(await screen.findByText(CONFIRM_PASSWORD_ERROR)).toBeInTheDocument();
    expect(await screen.findByText('Consent is required to register')).toBeInTheDocument();
  });

  it('registers with a Singapore primary number, sends booleans and keys, then signs in to see the status', async () => {
    const registered = { ...LIN, name: 'Test Partner', primaryPhone: '+6598765432', singaporePhone: '+6598765432' };
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/sign-up', status: 201, body: { partner: registered, slot: slotsFor('tampines')[0] } },
      { method: 'POST', path: '/partner/auth/login', body: registered },
      { path: '/partner/me', body: { partner: registered, slot: slotsFor('tampines')[0] } },
    ]);
    renderPartner();

    expect(screen.queryByText(COPY_PRIMARY_LABEL)).not.toBeInTheDocument();
    await fillDetails('+65 9876 5432');
    await userEvent.click(screen.getByRole('checkbox', { name: COPY_PRIMARY_LABEL }));
    expect(screen.getByLabelText('Singapore mobile number (optional)')).toHaveValue('+65 9876 5432');

    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText(THANK_YOU.title)).toBeInTheDocument();
    expect(screen.getByText(THANK_YOU.onboardingNote)).toBeInTheDocument();
    expect(screen.getByText('UC Tampines Centre, Tampines')).toBeInTheDocument();

    const [body] = requestsTo(fetchMock, 'POST', '/partner/sign-up');
    expect(body).toMatchObject({
      name: 'Test Partner',
      primaryPhone: '+65 9876 5432',
      singaporePhone: '+65 9876 5432',
      password: PASSWORD,
      source: 'tiktok',
      cookingFrequency: 'daily',
      comfortableWithDogs: true,
      deepCleaningExperience: false,
      consent: true,
      interviewCity: 'tampines',
      slotId: slotsFor('tampines')[0].id,
    });
    expect(body).not.toHaveProperty('confirmPassword');

    await userEvent.click(screen.getByRole('button', { name: THANK_YOU.checkStatus }));
    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.phoneLabel), '+65 9876 5432');
    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.passwordLabel), PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LOGIN }));

    expect(await screen.findByText(PARTNER_STATUS.title)).toBeInTheDocument();
    expect(screen.getAllByText('Test Partner')).toHaveLength(2);
    expect(screen.getByText('UC Tampines Centre, Tampines')).toBeInTheDocument();
  }, 30000);

  it('shows the backend error when the number is already registered', async () => {
    stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/sign-up', status: 409, body: { error: { code: 'PHONE_ALREADY_REGISTERED' } } },
    ]);
    renderPartner();

    await fillDetails('+95 9876 0000');
    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText(API_ERROR.duplicatePhone)).toBeInTheDocument();
    expect(screen.queryByText(THANK_YOU.title)).not.toBeInTheDocument();
  }, 20000);

  it('redirects anonymous visitors to login and shows a verified partner at the verified stage after sign-in', async () => {
    stubApi([
      ...BASE_STUBS,
      { path: '/partner/auth/me', status: 401, body: { error: { code: 'UNAUTHORIZED' } } },
      { method: 'POST', path: '/partner/auth/login', body: THANDAR },
      { path: '/partner/me', body: { partner: THANDAR, slot: undefined } },
    ]);
    renderPartner('/partner/status');

    expect(await screen.findByText(PARTNER_LOGIN.title)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.phoneLabel), '+65 9000 0001');
    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.passwordLabel), 'Demo123!');
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LOGIN }));

    expect(await screen.findByText(PARTNER_STATUS.stages[1].title)).toBeInTheDocument();
    expect(screen.getAllByText('Thandar Aung')).toHaveLength(2);
    expect(screen.getByText(PARTNER_STATUS.stages[1].title).closest('.ant-steps-item')).toHaveClass('ant-steps-item-process');
    expect(THANDAR.stage).toBe(PartnerStage.Verified);
  });

  it('shows a wrong password error from the backend', async () => {
    stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/partner/auth/login', status: 401, body: { error: { code: 'INVALID_CREDENTIALS' } } },
    ]);
    renderPartner('/partner/login');

    await userEvent.type(await screen.findByLabelText(PARTNER_LOGIN.phoneLabel), '+65 9000 0001');
    await userEvent.type(screen.getByLabelText(PARTNER_LOGIN.passwordLabel), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LOGIN }));

    expect(await screen.findByText(API_ERROR.invalidCredentials)).toBeInTheDocument();
  });
});
