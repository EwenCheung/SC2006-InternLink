import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Edit, Upload, Users, Building, MapPin, Link as LinkIcon } from "lucide-react";

export default function EmployerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employer profile data
        const { data: profileResponse } = await api.get("/employers/profile");
        setProfile(profileResponse.data);
        
        // Fetch job listings
        const { data: jobsResponse } = await api.get("/jobs/employer");
        setJobs(jobsResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleEditProfile = () => {
    navigate("/employer/edit-profile");
  };
  
  const handleUploadLogo = () => {
    // Implement logo upload logic
    toast.success("Company logo updated successfully");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Use mock data until backend is ready
  const mockProfile = {
    companyName: user?.companyName || "Tech Solutions Pte Ltd",
    email: user?.email || "hr@techsolutions.com",
    industry: "Information Technology",
    location: "Singapore",
    website: "https://techsolutions.example.com",
    foundedYear: "2010",
    companySize: "50-100 employees",
    description: "Tech Solutions is a leading IT company specializing in software development, web design, and digital transformation solutions. We work with clients across various industries to deliver innovative technology solutions that drive business growth.",
    logoUrl: "https://i.pravatar.cc/300",
  };
  
  const mockJobs = [
    {
      id: "job1",
      title: "Frontend Developer Intern",
      type: "internship",
      duration: "3 months",
      location: "Singapore",
      postedDate: "2024-03-01",
      applicantsCount: 12,
    },
    {
      id: "job2",
      title: "UX/UI Designer",
      type: "internship",
      duration: "6 months",
      location: "Remote",
      postedDate: "2024-03-05",
      applicantsCount: 8,
    },
    {
      id: "job3",
      title: "Weekend Marketing Assistant",
      type: "adhoc",
      duration: "2 days",
      location: "Singapore",
      postedDate: "2024-03-10",
      applicantsCount: 5,
    }
  ];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <Button onClick={handleEditProfile}>
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-lg overflow-hidden mb-4 bg-white flex items-center justify-center p-2">
                  <img 
                    src={mockProfile.logoUrl} 
                    alt="Company Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button variant="outline" onClick={handleUploadLogo}>
                  <Upload className="mr-2 h-4 w-4" /> Change Logo
                </Button>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center">
                    <Building className="mr-2 h-4 w-4" /> Company Name
                  </h3>
                  <p>{mockProfile.companyName}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{mockProfile.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    <MapPin className="mr-2 h-4 w-4" /> Location
                  </h3>
                  <p>{mockProfile.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" /> Website
                  </h3>
                  <a href={mockProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {mockProfile.website}
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Industry</h3>
                    <p>{mockProfile.industry}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Founded</h3>
                    <p>{mockProfile.foundedYear}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    <Users className="mr-2 h-4 w-4" /> Company Size
                  </h3>
                  <p>{mockProfile.companySize}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Company Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{mockProfile.description}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>
                Manage your company's job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockJobs.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">You haven't posted any jobs yet.</p>
                ) : (
                  mockJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span className="mr-4">{job.type === 'internship' ? 'Internship' : 'Ad-hoc'}</span>
                            <span className="mr-4">{job.duration}</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          {job.applicantsCount} Applicants
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">Posted: {job.postedDate}</span>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/employer/${job.type === 'internship' ? 'internship' : 'adhoc'}-job-details/${job.id}`)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/employer/view-candidates/${job.id}`)}
                          >
                            View Candidates
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}