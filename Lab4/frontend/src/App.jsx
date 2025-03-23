import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Layouts
import RootLayout from "@/layouts/RootLayout";

// Auth Pages
import ChooseRolePage from "@/pages/auth/ChooseRolePage";
import JobSeekerLoginPage from "@/pages/auth/jobseeker/LoginPage";
import JobSeekerRegisterPage from "@/pages/auth/jobseeker/RegisterPage";
import EmployerLoginPage from "@/pages/auth/employer/LoginPage";
import EmployerRegisterPage from "@/pages/auth/employer/RegisterPage";

// Job Seeker Pages
import HomePage from "@/pages/HomePage";
import FindJobsPage from "@/pages/jobs/FindJobsPage";
import JobDetailsPage from "@/pages/jobs/JobDetailsPage";

// Employer Pages
import EmployerDashboardPage from "@/pages/employer/DashboardPage";
import PostInternshipPage from "@/pages/employer/jobs/PostInternshipPage";
import PostAdhocPage from "@/pages/employer/jobs/PostAdhocPage";

const queryClient = new QueryClient();

// TODO: Replace with actual auth check
const isAuthenticated = false;
const userRole = "jobseeker"; // or "employer"

function PrivateRoute({ children, allowedRoles = [] }) {
  if (!isAuthenticated) {
    return <Navigate to="/auth/choose-role" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="auth">
              <Route path="choose-role" element={<ChooseRolePage />} />
              <Route path="jobseeker">
                <Route path="login" element={<JobSeekerLoginPage />} />
                <Route path="register" element={<JobSeekerRegisterPage />} />
              </Route>
              <Route path="employer">
                <Route path="login" element={<EmployerLoginPage />} />
                <Route path="register" element={<EmployerRegisterPage />} />
              </Route>
            </Route>

            {/* Job Seeker Routes */}
            <Route path="jobs">
              <Route
                index
                element={
                  <PrivateRoute allowedRoles={["jobseeker"]}>
                    <FindJobsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <PrivateRoute allowedRoles={["jobseeker"]}>
                    <JobDetailsPage />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Employer Routes */}
            <Route path="employer">
              <Route
                path="dashboard"
                element={
                  <PrivateRoute allowedRoles={["employer"]}>
                    <EmployerDashboardPage />
                  </PrivateRoute>
                }
              />
              <Route path="jobs/new">
                <Route
                  path="internship"
                  element={
                    <PrivateRoute allowedRoles={["employer"]}>
                      <PostInternshipPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="adhoc"
                  element={
                    <PrivateRoute allowedRoles={["employer"]}>
                      <PostAdhocPage />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
