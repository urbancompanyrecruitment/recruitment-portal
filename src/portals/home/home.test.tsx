import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LegacyPartnerRedirect } from '@/app/LegacyPartnerRedirect';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HOME, HOME_OPTIONS } from './constant';
import HomePortal from '.';

const CurrentPath = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="current-path">{`${pathname}${search}`}</div>;
};

describe('home page', () => {
  it('offers exactly two ways in, the candidate dashboard and the recruiter dashboard, and no admin link', () => {
    renderWithProviders(<HomePortal />);

    expect(screen.getByRole('heading', { name: HOME.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: HOME_OPTIONS[0].action })).toHaveAttribute('href', '/candidate');
    expect(screen.getByRole('link', { name: HOME_OPTIONS[1].action })).toHaveAttribute('href', '/recruiter');
    expect(HOME_OPTIONS).toHaveLength(2);
    expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).not.toContainEqual(expect.stringMatching(/^\/admin/));
  });

  it('sends old /partner links to the same page under /candidate', () => {
    renderWithProviders(
      <Routes>
        <Route path="/partner/*" element={<LegacyPartnerRedirect />} />
        <Route path="/candidate/*" element={<CurrentPath />} />
      </Routes>,
      { route: '/partner/status?from=sms' },
    );

    expect(screen.getByTestId('current-path')).toHaveTextContent('/candidate/status?from=sms');
  });
});
