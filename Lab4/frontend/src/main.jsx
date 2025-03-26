import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './index.css';

// Initialize web app
const renderApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(container);

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
};

// Add error handling for script loading
try {
  renderApp();
} catch (error) {
  console.error('Failed to start application:', error);
  document.body.innerHTML = `
    <div style="
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="color: #e11d48; font-size: 24px; margin-bottom: 16px;">
        Application Failed to Load
      </h1>
      <p style="color: #4b5563; margin-bottom: 16px;">
        Please try refreshing the page. If the problem persists, contact support.
      </p>
      <button onclick="window.location.reload()" style="
        background-color: #7e22ce;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
      ">
        Reload Page
      </button>
    </div>
  `;
}
