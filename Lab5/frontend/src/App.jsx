import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NotFound from './components/Common/NotFound';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ChooseRolePage from './pages/ChooseRolePage';
// Import debug component
import EnvDebug from './components/Debug/EnvDebug';
import JS_FindInternshipPage from './pages/JobSeeker/JS_FindInternshipPage';
import JS_FindAdHocPage from './pages/JobSeeker/JS_FindAdHocPage';
import JS_InternshipDetailsPage from './pages/JobSeeker/JS_InternshipDetailsPage';
import JS_AdHocDetailsPage from './pages/JobSeeker/JS_AdHocDetailsPage';
import JS_EmailLoginPage from './pages/JobSeeker/JS_EmailLoginPage';
import JS_EmailSignupPage from './pages/JobSeeker/JS_EmailSignupPage';
import JS_ProfilePage from './pages/JobSeeker/JS_ProfilePage';
import JS_MessagesPage from './pages/JobSeeker/JS_MessagesPage';
import JS_ViewApplicationPage from './pages/JobSeeker/JS_ViewApplicationPage';
import JS_PrivacySettings from './pages/JobSeeker/JS_PrivacySettings';
import JS_InternshipApplicationPage from './pages/JobSeeker/JS_InternshipApplicationPage';
import JS_AdHocApplicationPage from './pages/JobSeeker/JS_AdHocApplicationPage';
import EP_EmailLoginPage from './pages/Employer/EP_EmailLoginPage';
import EP_EmailSignupPage from './pages/Employer/EP_EmailSignupPage';
import EP_PostInternshipPage from './pages/Employer/EP_PostInternshipPage';
import EP_PostAdHocPage from './pages/Employer/EP_PostAdHocPage';
import EP_InternshipDetailsPage from './pages/Employer/EP_InternshipDetailsPage';
import EP_AdHocDetailsPage from './pages/Employer/EP_AdHocDetailsPage';
import EP_AddInternshipPage from './pages/Employer/EP_AddInternshipPage';
import EP_AddAdHocPage from './pages/Employer/EP_AddAdHocPage';
import EP_ProfilePage from './pages/Employer/EP_ProfilePage';
import EP_MessagesPage from './pages/Employer/EP_MessagesPage';
import EP_PrivacySettings from './pages/Employer/EP_PrivacySettings';
import LogOutConfirmation from './pages/LogOutConfirmation';
import ProtectedRoute from './components/Common/ProtectedRoute';

const App = () => {
  const location = useLocation();

  // Clear localStorage on initial app load to force starting from the choose role page
  useEffect(() => {
    // Clear user data only when accessing the root path directly
    if (location.pathname === '/') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log('Session cleared - redirecting to Choose Role page');
    }
  }, [location.pathname]);

  // Function to check if user is already logged in and redirect accordingly
  const handleRootRoute = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (token && user.role) {
      if (user.role === 'jobseeker') {
        return <Navigate to="/jobseeker/find-internship" replace />;
      } else if (user.role === 'employer') {
        return <Navigate to="/employer/post-internship" replace />;
      }
    }
    return <ChooseRolePage />;
  };

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        {/* Root route with conditional navigation */}
        <Route path="/" element={handleRootRoute()} />
        <Route path="/logout" element={<LogOutConfirmation />} />

        {/* JobSeeker auth routes */}
        <Route path="/jobseeker/login" element={<JS_EmailLoginPage />} />
        <Route path="/jobseeker/signup" element={<JS_EmailSignupPage />} />

        {/* JobSeeker protected routes */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute role="jobseeker" />}>
            <Route path="/jobseeker/find-internship" element={<JS_FindInternshipPage />} />
            <Route path="/jobseeker/find-adhoc" element={<JS_FindAdHocPage />} />
            <Route path="/jobseeker/internship/:id" element={<JS_InternshipDetailsPage />} />
            <Route path="/jobseeker/internship-application/:jobId" element={<JS_InternshipApplicationPage />} />
            <Route path="/jobseeker/adhoc/:id" element={<JS_AdHocDetailsPage />} />
            <Route path="/jobseeker/adhoc-application/:jobId" element={<JS_AdHocApplicationPage />} />
            <Route path="/jobseeker/messages" element={<JS_MessagesPage />} />
            <Route path="/jobseeker/profile" element={<JS_ProfilePage />} />
            <Route path="/jobseeker/applications/:id" element={<JS_ViewApplicationPage />} />
            <Route path="/jobseeker/js-privacy-settings" element={<JS_PrivacySettings />} />
          </Route>
        </Route>

        {/* Employer auth routes */}
        <Route path="/employer/login" element={<EP_EmailLoginPage />} />
        <Route path="/employer/signup" element={<EP_EmailSignupPage />} />

        {/* Employer protected routes */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute role="employer" />}>
            <Route path="/employer/post-internship" element={<EP_PostInternshipPage />} />
            <Route path="/employer/post-adhoc" element={<EP_PostAdHocPage />} />
            <Route path="/employer/add-internship" element={<EP_AddInternshipPage />} />
            <Route path="/employer/add-adhoc" element={<EP_AddAdHocPage />} />
            <Route path="/employer/internship/:id" element={<EP_InternshipDetailsPage />} />
            <Route path="/employer/adhoc/:id" element={<EP_AdHocDetailsPage />} />
            <Route path="/employer/messages" element={<EP_MessagesPage />} />
            <Route path="/employer/profile" element={<EP_ProfilePage />} />
            <Route path="/employer/adhoc-details/:id" element={<EP_AdHocDetailsPage />} />
            <Route path="/employer/internship-details/:id" element={<EP_InternshipDetailsPage />} />
            <Route path="/employer/ep-privacy-settings" element={<EP_PrivacySettings />} />
            
          </Route>
        </Route>

        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
