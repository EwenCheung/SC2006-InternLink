import React from 'react';

const EP_MessagePage = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '20px'
  };

  const headingStyle = {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#333'
  };

  const textStyle = {
    fontSize: '1.2rem',
    color: '#666'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Messages</h1>
      <p style={textStyle}>To Be Continued...</p>
      <p style={textStyle}>Message feature will be implemented in a future update.</p>
    </div>
  );
};

export default EP_MessagePage;
