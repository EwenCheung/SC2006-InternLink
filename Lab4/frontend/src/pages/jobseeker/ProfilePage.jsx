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
import { Edit, Upload, FileText, Check, Clock, X } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const { data: profileResponse } = await api.get("/users/profile");
        setProfile(profileResponse.data);

        // Fetch applications
        const { data: applicationsResponse } = await api.get("/applications/user");
        setApplications(applicationsResponse.data);
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
    navigate("/jobseeker/edit-profile");
  };

  const handleUploadResume = () => {
    // Implement resume upload logic
    toast.success("Resume uploaded successfully");
  };

  const handleUploadPhoto = () => {
    // Implement photo upload logic
    toast.success("Profile photo updated successfully");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"><Check size={12} className="mr-1" /> Accepted</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center"><X size={12} className="mr-1" /> Rejected</span>;
      case "interview":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"><Clock size={12} className="mr-1" /> Interview</span>;
      case "shortlisted":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center"><Check size={12} className="mr-1" /> Shortlisted</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center"><Clock size={12} className="mr-1" /> Pending</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Use mock data until backend is ready
  const mockProfile = {
    name: user?.name || "Student Name",
    email: user?.email || "student@example.com",
    university: "Nanyang Technological University",
    course: "Computer Science",
    graduationYear: "2025",
    personalStatement: "I am a passionate computer science student looking for opportunities to apply my skills in a real-world setting. My interests include web development, data science, and UI/UX design.",
    skills: ["JavaScript", "React", "Node.js", "Python", "UI/UX Design"],
    profileImage: "https://i.pravatar.cc/300",
    resume: "resume.pdf"
  };

  const mockApplications = [
    {
      id: "app1",
      jobTitle: "Frontend Developer Intern",
      company: "Tech Solutions Pte Ltd",
      appliedDate: "2024-03-15",
      status: "accepted",
      jobType: "internship"
    },
    {
      id: "app2",
      jobTitle: "UI Design Weekend Project",
      company: "Creative Studios",
      appliedDate: "2024-03-10",
      status: "interview",
      jobType: "adhoc"
    },
    {
      id: "app3",
      jobTitle: "Data Science Intern",
      company: "Analytics Corp",
      appliedDate: "2024-03-05",
      status: "pending",
      jobType: "internship"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button onClick={handleEditProfile}>
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden mb-4">
                  <img 
                    src={mockProfile.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button variant="outline" onClick={handleUploadPhoto}>
                  <Upload className="mr-2 h-4 w-4" /> Change Photo
                </Button>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{mockProfile.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{mockProfile.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">University</h3>
                  <p>{mockProfile.university}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Course</h3>
                  <p>{mockProfile.course}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Expected Graduation</h3>
                  <p>{mockProfile.graduationYear}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Personal Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{mockProfile.personalStatement}</p>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockProfile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <FileText size={48} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    {mockProfile.resume || "No resume uploaded"}
                  </p>
                </div>
                <Button variant="outline" onClick={handleUploadResume}>
                  <Upload className="mr-2 h-4 w-4" /> {mockProfile.resume ? "Update Resume" : "Upload Resume"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>
                Track the status of your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockApplications.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">You haven't applied to any positions yet.</p>
                ) : (
                  mockApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
                          <p className="text-gray-600">{application.company}</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">Applied: {application.appliedDate}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/jobseeker/${application.jobType === 'internship' ? 'internship' : 'adhoc'}-job-details/${application.id}`)}
                        >
                          View Job
                        </Button>
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