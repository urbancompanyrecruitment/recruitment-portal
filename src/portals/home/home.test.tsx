import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HOME, HOME_OPTIONS } from './constant';
import HomePortal from '.';

describe('home page', () => {
  it('offers exactly two ways in, the partner dashboard and the recruiter dashboard, and no admin link', () => {
    renderWithProviders(<HomePortal />);

    expect(screen.getByRole('heading', { name: HOME.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: HOME_OPTIONS[0].action })).toHaveAttribute('href', '/partner');
    expect(screen.getByRole('link', { name: HOME_OPTIONS[1].action })).toHaveAttribute('href', '/recruiter');
    expect(HOME_OPTIONS).toHaveLength(2);
    expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).not.toContainEqual(expect.stringMatching(/^\/admin/));
  });
});
