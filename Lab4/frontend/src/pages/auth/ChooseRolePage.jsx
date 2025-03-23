import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ChooseRolePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-center">Job Seeker</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth/jobseeker/login")}
            >
              Continue as Job Seeker
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-center">Employer</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => navigate("/auth/employer/login")}
            >
              Continue as Employer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
