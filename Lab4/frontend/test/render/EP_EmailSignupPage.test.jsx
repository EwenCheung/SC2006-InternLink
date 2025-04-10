import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EP_EmailSignupPage from '@/pages/Employer/EP_EmailSignupPage.jsx';

describe('EP_EmailSignupPage Component', () => {
  it('renders all form labels correctly', () => {
    render(
      <MemoryRouter>
        <EP_EmailSignupPage />
      </MemoryRouter>
    );
    const labels = [
      'Displayed Name',
      'Company Name',
      'Email Address',
      'Password',
      'Confirm Password',
      'Displayed Name',
      'Company Name',
      'Email Address',
      'Password',
      'Confirm Password',
    ];

    const inputFields = [
      { placeholder: 'Enter your display name' },
      { placeholder: 'Enter your company name' },
      { placeholder: 'Enter your email' },
      { placeholder: 'Create a password' },
      { placeholder: 'Confirm your password' },
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    const buttons = [
      { name: /Sign up/i },
      { name: /Sign up with Google/i },
      { name: /Sign up with GitHub/i },
    ];

    buttons.forEach(({ name }) => {
      const matchingButtons = screen.getAllByRole('button', { name });
      expect(matchingButtons.length).toBeGreaterThan(0);
    });
  });
});
