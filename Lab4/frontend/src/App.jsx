import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NotFound from './components/Common/NotFound';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ChooseRolePage from './pages/ChooseRolePage';
import LogOutConfirmation from './pages/LogOutConfirmation';
import JS_EmailLoginPage from './pages/JobSeeker/JS_EmailLoginPage';
import JS_EmailSignupPage from './pages/JobSeeker/JS_EmailSignupPage';
import JS_ViewApplicationPage from './pages/JobSeeker/JS_ViewApplicationPage';
import JS_FindInternshipPage from './pages/JobSeeker/JS_FindInternshipPage';
import JS_FindAdHocPage from './pages/JobSeeker/JS_FindAdHocPage';
import JS_InternshipDetailsPage from './pages/JobSeeker/JS_InternshipDetailsPage';
import JS_AdHocDetailsPage from './pages/JobSeeker/JS_AdHocDetailsPage';
import JS_MessagesPage from './pages/JobSeeker/JS_MessagesPage';
import JS_ProfilePage from './pages/JobSeeker/JS_ProfilePage';
import EP_EmailLoginPage from './pages/Employer/EP_EmailLoginPage';
import EP_EmailSignupPage from './pages/Employer/EP_EmailSignupPage';
import EP_AddPostPage from './pages/Employer/EP_AddPostPage';
import EP_PostInternshipPage from './pages/Employer/EP_PostInternshipPage';
import EP_PostAdHocPage from './pages/Employer/EP_PostAdHocPage';
import EP_InternshipDetailsPage from './pages/Employer/EP_InternshipDetailsPage';
import EP_AdHocDetailsPage from './pages/Employer/EP_AdHocDetailsPage';
import EP_ViewCandidatesPage from './pages/Employer/EP_ViewCandidatesPage';
import EP_MessagesPage from './pages/Employer/EP_MessagesPage';
import EP_ProfilePage from './pages/Employer/EP_ProfilePage';

const App = () => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ChooseRolePage />} />
        <Route path="/logout" element={<LogOutConfirmation />} />

        {/* JobSeeker routes */}
        <Route element={<Layout />}>
          <Route path="/jobseeker/login" element={<JS_EmailLoginPage />} />
          <Route path="/jobseeker/signup" element={<JS_EmailSignupPage />} />
          <Route path="/jobseeker/find-internship" element={<JS_FindInternshipPage />} />
          <Route path="/jobseeker/find-adhoc" element={<JS_FindAdHocPage />} />
          <Route path="/jobseeker/internship/:id" element={<JS_InternshipDetailsPage />} />
          <Route path="/jobseeker/adhoc/:id" element={<JS_AdHocDetailsPage />} />
          <Route path="/jobseeker/messages" element={<JS_MessagesPage />} />
          <Route path="/jobseeker/profile" element={<JS_ProfilePage />} />
          <Route path="/jobseeker/applications" element={<JS_ViewApplicationPage />} />
        </Route>

        {/* Employer routes */}
        <Route element={<Layout />}>
          <Route path="/employer/login" element={<EP_EmailLoginPage />} />
          <Route path="/employer/signup" element={<EP_EmailSignupPage />} />
          <Route path="/employer/post-internship" element={<EP_PostInternshipPage />} />
          <Route path="/employer/post-adhoc" element={<EP_PostAdHocPage />} />
          <Route path="/employer/add-post" element={<EP_AddPostPage />} />
          <Route path="/employer/internship/:id" element={<EP_InternshipDetailsPage />} />
          <Route path="/employer/adhoc/:id" element={<EP_AdHocDetailsPage />} />
          <Route path="/employer/candidates" element={<EP_ViewCandidatesPage />} />
          <Route path="/employer/messages" element={<EP_MessagesPage />} />
          <Route path="/employer/profile" element={<EP_ProfilePage />} />
        </Route>

        {/* Catch all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
