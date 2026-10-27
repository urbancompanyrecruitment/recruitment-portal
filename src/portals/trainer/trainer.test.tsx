import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { UserRole } from '@/domain/interface';
import { Sessions } from '@/shared/auth/interface';
import { TRAINER_SG_SESSION } from '@/test/constant';
import { renderWithProviders } from '@/test/renderWithProviders';
import TrainerPortal from '.';

const renderPortal = (route: string, sessions: Sessions = { [UserRole.Trainer]: TRAINER_SG_SESSION }) =>
  renderWithProviders(
    <Routes>
      <Route path="/trainer/*" element={<TrainerPortal />} />
    </Routes>,
    { route, sessions },
  );

describe('Trainer portal', () => {
  it('sends a visitor without a trainer session to the sign-in page', async () => {
    renderPortal('/trainer/candidates', {});

    expect(await screen.findByRole('heading', { name: 'Trainer sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sarah Tan · Singapore' })).toBeInTheDocument();
  });

  it('shows only candidates from the trainer geography', async () => {
    renderPortal('/trainer/candidates');

    expect(await screen.findByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.getByText('Zar Ni')).toBeInTheDocument();
    expect(screen.queryByText('May Thu')).not.toBeInTheDocument();
    expect(screen.queryByText('Siti Rahma')).not.toBeInTheDocument();
  });

  it('filters the list by the UC Verified status tab', async () => {
    const user = userEvent.setup();
    renderPortal('/trainer/candidates');
    await screen.findByText('Zar Ni');

    await user.click(screen.getByRole('tab', { name: /UC Verified/ }));

    expect(screen.getByText('Thandar Aung')).toBeInTheDocument();
    expect(screen.queryByText('Zar Ni')).not.toBeInTheDocument();
  });

  it('redirects to the list with an error when the candidate is outside the trainer geography', async () => {
    renderPortal('/trainer/candidates/c2');

    expect(await screen.findByText(/outside your geography/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Trainer dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('May Thu')).not.toBeInTheDocument();
  });

  it('keeps later stages locked until earlier stages pass', async () => {
    renderPortal('/trainer/candidates/c12');
    await screen.findByRole('heading', { name: 'Lin Lin Htet' });

    const l3 = screen.getByRole('group', { name: /^L3/ });
    expect(within(l3).getByRole('button', { name: 'Save result' })).toBeDisabled();
    expect(within(l3).getByRole('combobox')).toBeDisabled();
    expect(within(screen.getByRole('group', { name: /^L1/ })).getByRole('combobox')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Confirm UC Verified' })).toBeDisabled();
  });

  it('enables UC verification once L3 is recorded as Passed', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    renderPortal('/trainer/candidates/c11');
    await screen.findByRole('heading', { name: 'Zar Ni' });
    expect(screen.getByRole('button', { name: 'Confirm UC Verified' })).toBeDisabled();

    const l3 = screen.getByRole('group', { name: /^L3/ });
    await user.click(within(l3).getByRole('combobox'));
    const passedOption = screen
      .getAllByTitle('Passed')
      .find(element => element.classList.contains('ant-select-item-option'));
    await user.click(passedOption!);
    expect(within(l3).getByTitle('Passed')).toBeInTheDocument();
    await user.click(within(l3).getByRole('button', { name: 'Save result' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm UC Verified' })).toBeEnabled());
    expect(screen.getByText('Pending → Passed')).toBeInTheDocument();
    expect(screen.getByText('L3 marked Passed')).toBeInTheDocument();
  });

  it('shows only the trainer sessions by default and colleagues on request', async () => {
    const user = userEvent.setup();
    renderPortal('/trainer/schedule');

    expect(await screen.findByText('Maria Lopez')).toBeInTheDocument();
    expect(screen.getByText('Lin Lin Htet')).toBeInTheDocument();
    expect(screen.queryByText('Daniel Lim')).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Only my sessions' }));

    expect(await screen.findByText('Daniel Lim')).toBeInTheDocument();
    expect(screen.getByText('No candidates booked yet.')).toBeInTheDocument();
  });
});
