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

export default function EmployerLayout() {
  const { user, loading, logout } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== "employer") {
    return <Navigate to="/auth/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/employer/dashboard" className="text-xl font-bold flex items-center">
              <img src="/Images/Logo2.png" alt="InternLink" className="h-8 mr-2" />
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link to="/employer/internships" className="text-gray-700 hover:text-purple-600">
              Post Internship
            </Link>
            <Link to="/employer/adhoc" className="text-gray-700 hover:text-purple-600">
              Post Ad Hoc
            </Link>
            <Link to="/messages" className="text-gray-700 hover:text-purple-600">
              Messages
            </Link>
            <Link to="/employer/profile" className="text-gray-700 hover:text-purple-600">
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
                  <Link to="/employer/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/employer/preferences">
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
