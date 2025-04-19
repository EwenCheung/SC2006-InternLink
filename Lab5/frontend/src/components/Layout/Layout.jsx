import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './Navigation/NavigationBar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
