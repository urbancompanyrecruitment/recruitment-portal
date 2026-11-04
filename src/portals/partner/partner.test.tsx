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
  await chooseOption('Country / route you want to interview in', 'Singapore');
  await userEvent.click((await screen.findAllByText(/seats left/))[0]);
  await userEvent.click(screen.getByRole('checkbox', { name: /I consent/ }));
};

describe('partner portal', () => {
  it('shows centre details for the chosen interview slot', async () => {
    renderPartner();

    await chooseOption('Country / route you want to interview in', 'Myanmar');
    await userEvent.click(await screen.findByText(/seats left/));

    expect(await screen.findByText('UC Yangon Training Centre', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText(/Kamayut Township/)).toBeInTheDocument();
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
    expect(screen.getByText('UC Singapore Training Centre')).toBeInTheDocument();
    expect(screen.queryByText(/Simulate L1/)).not.toBeInTheDocument();
    await waitFor(() => {
      const saved = readDb().candidates.find(candidate => candidate.name === 'Test Partner');
      expect(saved?.singaporePhone).toBe('+65 9876 5432');
      expect(saved?.onboarding?.leadId).toMatch(/^lead-/);
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
