import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function MainNav() {
  return (
    <nav className="flex items-center justify-between w-full">
      <Link to="/" className="text-xl font-bold">
        InternLink
      </Link>
      <div className="flex items-center space-x-4">
        <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Jobs
        </Link>
        <Link to="/auth/choose-role" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Get Started
        </Link>
        <Link to="/auth/jobseeker/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Login
        </Link>
        <Link to="/auth/jobseeker/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Register
        </Link>
      </div>
    </nav>
  )
}
