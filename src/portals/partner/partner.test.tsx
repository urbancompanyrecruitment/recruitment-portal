import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { readDb } from '@/mocks/db';
import { renderWithProviders } from '@/test/renderWithProviders';
import PartnerPortal from '.';

const renderPartner = (route: string) =>
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

describe('partner portal', () => {
  it('shows centre details for the chosen interview slot', async () => {
    renderPartner('/partner');

    await chooseOption('Country / route you want to interview in', 'Myanmar');
    await userEvent.click(await screen.findByText(/seats left/));

    expect(await screen.findByText('UC Yangon Training Centre', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText(/Kamayut Township/)).toBeInTheDocument();
  });

  it('validates the WhatsApp number and consent', async () => {
    renderPartner('/partner');

    await userEvent.type(screen.getByLabelText('WhatsApp number with country code'), '91234567');
    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText('Use + and country code, e.g. +65 9123 4567')).toBeInTheDocument();
    expect(await screen.findByText('Consent is required to register')).toBeInTheDocument();
  });

  it('registers a partner and shows the confirmation with slot details', async () => {
    renderPartner('/partner');

    await userEvent.type(screen.getByLabelText('Full name'), 'Test Partner');
    await userEvent.type(screen.getByLabelText('WhatsApp number with country code'), '+65 9876 5432');
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
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /Complete registration/ }));

    expect(await screen.findByText('Your registration is complete')).toBeInTheDocument();
    expect(screen.getByText(/\+65 9876 5432/)).toBeInTheDocument();
    expect(screen.getByText('UC Singapore Training Centre')).toBeInTheDocument();
    await waitFor(() => expect(readDb().candidates.some(candidate => candidate.name === 'Test Partner')).toBe(true));
  }, 20000);

  it('lets the partner mark L1 complete from the confirmation screen', async () => {
    renderPartner('/partner/registration/c12');

    await userEvent.click(await screen.findByRole('button', { name: 'Simulate L1 completion' }));

    expect((await screen.findByText('L1 marked completed')).closest('button')).toBeDisabled();
    expect(readDb().candidates.find(candidate => candidate.id === 'c12')?.l1Completed).toBe(true);
  });

  it('shows not found for an unknown registration', async () => {
    renderPartner('/partner/registration/missing');

    expect(await screen.findByText('Registration not found')).toBeInTheDocument();
  });
});
