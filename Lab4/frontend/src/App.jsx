import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";

// Auth Pages
import ChooseRolePage from "./pages/auth/ChooseRolePage";
import JobSeekerLoginPage from "./pages/auth/jobseeker/LoginPage";
import JobSeekerSignupPage from "./pages/auth/jobseeker/SignupPage";
import EmployerLoginPage from "./pages/auth/employer/LoginPage";
import EmployerSignupPage from "./pages/auth/employer/SignupPage";

// JobSeeker Pages
import FindInternshipPage from "./pages/jobseeker/FindInternshipPage";
import FindAdHocPage from "./pages/jobseeker/FindAdhocPage";
import JobSeekerProfilePage from "./pages/jobseeker/ProfilePage";
import JobSeekerMessagesPage from "./pages/jobseeker/MessagesPage";
import JobSeekerInternshipDetailsPage from "./pages/jobseeker/JobSeekerInternshipDetailsPage";
import JobSeekerAdhocDetailsPage from "./pages/jobseeker/JobSeekerAdhocDetailsPage";

// Employer Pages
import PostInternshipPage from "./pages/employer/PostInternshipPage";
import PostAdHocPage from "./pages/employer/PostAdHocPage";
import EmployerProfilePage from "./pages/employer/ProfilePage";
import EmployerMessagesPage from "./pages/employer/MessagesPage";
import EmployerInternshipDetailsPage from "./pages/employer/EmployerInternshipDetailsPage";
import EmployerAdhocDetailsPage from "./pages/employer/EmployerAdhocDetailsPage";
import ViewCandidatesPage from "./pages/employer/ViewCandidatesPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirect root to choose role */}
          <Route path="/" element={<Navigate to="/auth/choose-role" />} />
          
          {/* Auth Routes */}
          <Route path="/auth/choose-role" element={<ChooseRolePage />} />
          <Route path="/auth/jobseeker/login" element={<JobSeekerLoginPage />} />
          <Route path="/auth/jobseeker/signup" element={<JobSeekerSignupPage />} />
          <Route path="/auth/employer/login" element={<EmployerLoginPage />} />
          <Route path="/auth/employer/signup" element={<EmployerSignupPage />} />
          
          {/* JobSeeker Routes */}
          <Route path="/jobseeker/find-internship" element={<FindInternshipPage />} />
          <Route path="/jobseeker/find-adhoc" element={<FindAdHocPage />} />
          <Route path="/jobseeker/profile" element={<JobSeekerProfilePage />} />
          <Route path="/jobseeker/messages" element={<JobSeekerMessagesPage />} />
          <Route path="/jobseeker/internship-job-details/:id" element={<JobSeekerInternshipDetailsPage />} />
          <Route path="/jobseeker/adhoc-job-details/:id" element={<JobSeekerAdhocDetailsPage />} />

          {/* Employer Routes */}
          <Route path="/employer/post-internship" element={<PostInternshipPage />} />
          <Route path="/employer/post-adhoc" element={<PostAdHocPage />} />
          <Route path="/employer/profile" element={<EmployerProfilePage />} />
          <Route path="/employer/messages" element={<EmployerMessagesPage />} />
          <Route path="/employer/internship-job-details/:id" element={<EmployerInternshipDetailsPage />} />
          <Route path="/employer/adhoc-job-details/:id" element={<EmployerAdhocDetailsPage />} />
          <Route path="/employer/view-candidates/:jobId" element={<ViewCandidatesPage />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
