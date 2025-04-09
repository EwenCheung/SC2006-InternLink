import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EP_AddInternshipPage from '@/pages/Employer/EP_AddInternshipPage';
import React from 'react';

describe('EP_AddInternshipPage Component', () => {
  it('renders all form labels correctly', () => {
    render(
      <MemoryRouter>
        <EP_AddInternshipPage />
      </MemoryRouter>
    );
    const labels = [
      'Job Title*',
      'Company Name*',
      'Address*',
      'Area*',
      'Job Description*',
      'Job Scope*',
      'Monthly Stipend (SGD)*',
      'Duration*',
      'Required Course of Study*',
      'Required Year of Study*',
      'Tags (Press Enter or comma to add)',
    ];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders all input fields and buttons correctly', () => {
    render(
      <MemoryRouter>
        <EP_AddInternshipPage />
      </MemoryRouter>
    );

    const inputFields = [
      { placeholder: 'e.g. Software Engineering Intern' },
      { placeholder: 'Your company name' },
      { placeholder: 'e.g. Singapore' },
      { placeholder: 'Overview of the internship position' },
      { placeholder: 'List the main responsibilities and tasks' },
      { placeholder: 'e.g. 1000' },
      { placeholder: 'e.g. Programming, Data Science, Frontend' },
    ];

    inputFields.forEach(({ placeholder }) => {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    const buttons = [
      { name: /Save as Draft/i },
      { name: /Publish Internship/i },
    ];

    buttons.forEach(({ name }) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
});
});
