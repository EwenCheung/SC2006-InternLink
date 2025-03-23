import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Settings, User, MessageSquare, LogOut } from "lucide-react";

export default function JobSeekerLayout() {
  const { user, loading, logout } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== "jobseeker") {
    return <Navigate to="/auth/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/jobseeker/dashboard" className="text-xl font-bold flex items-center">
              <img src="/Images/Logo2.png" alt="InternLink" className="h-8 mr-2" />
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link to="/jobseeker/internships" className="text-gray-700 hover:text-blue-600">
              Find Internship
            </Link>
            <Link to="/jobseeker/adhoc" className="text-gray-700 hover:text-blue-600">
              Find Ad Hoc
            </Link>
            <Link to="/messages" className="text-gray-700 hover:text-blue-600">
              Messages
            </Link>
            <Link to="/jobseeker/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/jobseeker/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/jobseeker/preferences">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Preferences</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
