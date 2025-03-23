import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/lib/utils/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobCard from "@/components/ui/job/JobCard";

export default function EmployerDashboardPage() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/employer");
      return data;
    },
  });

  const internships = jobs.filter((job) => job.type === "internship");
  const adhocJobs = jobs.filter((job) => job.type === "adhoc");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your job postings and applications
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/employer/jobs/new/internship">Post Internship</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/employer/jobs/new/adhoc">Post Ad-hoc Job</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Jobs</CardTitle>
            <CardDescription>All active job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Internships</CardTitle>
            <CardDescription>Active internship positions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{internships.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ad-hoc Jobs</CardTitle>
            <CardDescription>Active ad-hoc positions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{adhocJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="internships">
            <TabsList className="mb-4">
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="adhoc">Ad-hoc Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="internships">
              {isLoading ? (
                <div className="text-center">Loading internships...</div>
              ) : internships.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No internship positions posted yet
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {internships.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="adhoc">
              {isLoading ? (
                <div className="text-center">Loading ad-hoc jobs...</div>
              ) : adhocJobs.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No ad-hoc jobs posted yet
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {adhocJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
