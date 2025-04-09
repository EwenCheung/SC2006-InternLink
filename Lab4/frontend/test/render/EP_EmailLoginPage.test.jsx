import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EP_EmailLoginPage from '@/pages/Employer/EP_EmailLoginPage.jsx';

describe('EP_EmailLoginPage Component', () => {
  it('renders all form labels correctly', () => {
    render(
      <MemoryRouter>
        <EP_EmailLoginPage />
      </MemoryRouter>
    );
    const labels = [
      'Email address',
      'Password',
    ];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders all input fields and buttons correctly', () => {
    render(
      <MemoryRouter>
        <EP_EmailLoginPage />
      </MemoryRouter>
    );

    const inputFields = [
      { placeholder: 'Enter your email' },
      { placeholder: 'Enter your password' },
    ];

    inputFields.forEach(({ placeholder }) => {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    const buttons = [
      { name: /Sign in/i },
      { name: /Sign in with Google/i },
      { name: /Sign in with GitHub/i },
    ];

    buttons.forEach(({ name }) => {
      const matchingButtons = screen.getAllByRole('button', { name });
      expect(matchingButtons.length).toBeGreaterThan(0);
    });
  });
});
