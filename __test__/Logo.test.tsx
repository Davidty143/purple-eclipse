import '@testing-library/jest-dom'
import Logo from '../app/layout/components/Logo';
import { render, screen } from '@testing-library/react';

describe('Logo', () => {

  test('links to the homepage', () => {
    render(<Logo />);
    const logoLink = screen.getByRole('link');

    expect(logoLink).toHaveAttribute('href', '<LandingPage/>');
  });

  test('renders the logo image', () =>
  {
    render(<Logo />);
    const logoImage = screen.getByRole('img', { name: /Visconn Logo/i});
    expect(logoImage).toBeInTheDocument();
  })

});