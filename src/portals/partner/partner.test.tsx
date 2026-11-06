import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { readDb } from '@/mocks/db';
import { renderWithProviders } from '@/test/renderWithProviders';
import { COPY_PRIMARY_LABEL, SINGAPORE_PHONE_ERROR, THANK_YOU } from './constant';
import PartnerPortal from '.';

const renderPartner = () =>
  renderWithProviders(
    <Routes>
      <Route path="/partner/*" element={<PartnerPortal />} />
    </Routes>,
    { route: '/partner' },
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
    renderPartner();

    await chooseOption('Interview city', 'Jurong East');
    await chooseFirstSlot();

    expect(await screen.findByText('UC Jurong East Centre', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText(/Jurong Gateway Road/)).toBeInTheDocument();
    expect(screen.getByText(/seats left/)).toBeInTheDocument();
  });

  it('validates the primary number, the Singapore number and consent', async () => {
    renderPartner();

    await userEvent.type(screen.getByLabelText('Primary mobile number'), '91234567');
    await userEvent.type(screen.getByLabelText('Singapore mobile number (optional)'), '+65 1234');
    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText('Use + and country code, e.g. +65 9123 4567')).toBeInTheDocument();
    expect(await screen.findByText(SINGAPORE_PHONE_ERROR)).toBeInTheDocument();
    expect(await screen.findByText('Consent is required to register')).toBeInTheDocument();
  });

  it('offers to reuse a Singapore primary number and creates the onboarding lead', async () => {
    renderPartner();

    expect(screen.queryByText(COPY_PRIMARY_LABEL)).not.toBeInTheDocument();
    await fillDetails('+65 9876 5432');
    await userEvent.click(screen.getByRole('checkbox', { name: COPY_PRIMARY_LABEL }));

    expect(screen.getByLabelText('Singapore mobile number (optional)')).toHaveValue('+65 9876 5432');

    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText(THANK_YOU.title)).toBeInTheDocument();
    expect(screen.getByText(THANK_YOU.onboardingNote)).toBeInTheDocument();
    expect(screen.getByText('UC Tampines Centre, Tampines')).toBeInTheDocument();
    await waitFor(() => {
      const saved = readDb().candidates.find(candidate => candidate.name === 'Test Partner');
      expect(saved?.singaporePhone).toBe('+65 9876 5432');
      expect(saved?.onboarding?.leadId).toMatch(/^lead-/);
      expect(saved?.slotId).toMatch(/^tampines_\d{4}-\d{2}-\d{2}_\d{2}:00$/);
    });
  }, 20000);

  it('registers a partner without a Singapore number and creates no lead', async () => {
    renderPartner();

    await fillDetails('+95 9876 5432');

    expect(screen.queryByText(COPY_PRIMARY_LABEL)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText(THANK_YOU.title)).toBeInTheDocument();
    expect(screen.queryByText(THANK_YOU.onboardingNote)).not.toBeInTheDocument();
    await waitFor(() => {
      const saved = readDb().candidates.find(candidate => candidate.name === 'Test Partner');
      expect(saved?.onboarding).toBeUndefined();
    });
  }, 20000);
});
