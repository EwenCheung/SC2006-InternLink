import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import EP_EmailLoginPage from '../src/pages/Employer/EP_EmailLoginPage';

// Ensure expect is available globally for jest-dom
globalThis.expect = expect;

describe('Sign In Button', () => {
  test('renders the Sign In button and handles click event', () => {
    render(
      <BrowserRouter>
        <EP_EmailLoginPage />
      </BrowserRouter>
    );

    // Check if the Sign In button is rendered
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();

    // Simulate a click event
    fireEvent.click(signInButton);

    // Verify loading state
    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();

    // Verify that the button is disabled during loading
    expect(signInButton).toBeDisabled();

    // Add further assertions based on expected behavior after clicking
    // For example, check if navigation or API call is triggered
  });
});