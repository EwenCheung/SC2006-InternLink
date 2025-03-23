import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  MessageSquare, 
  FileText, 
  ArrowLeft, 
  User, 
  School, 
  Mail 
} from "lucide-react";

export default function ViewCandidatesPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const { data: jobResponse } = await api.get(`/jobs/${jobId}`);
        setJob(jobResponse.data);
        
        // Fetch applications for this job
        const { data: applicationsResponse } = await api.get(`/applications?jobId=${jobId}`);
        setCandidates(applicationsResponse.data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId]);
  
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: newStatus });
      
      // Update local state without refetching
      setCandidates(candidates.map(candidate => 
        candidate.id === applicationId ? { ...candidate, status: newStatus } : candidate
      ));
      
      toast.success(`Candidate status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast.error("Failed to update candidate status");
    }
  };
  
  const getFilteredCandidates = () => {
    if (filter === "all") return candidates;
    return candidates.filter(candidate => candidate.status === filter);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Use mock data until backend is ready
  const mockJob = {
    id: jobId,
    title: "Frontend Developer Intern",
    type: "internship",
    company: "Tech Solutions Pte Ltd",
    location: "Singapore",
    duration: "3 months",
  };
  
  const mockCandidates = [
    {
      id: "app1",
      applicantId: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      university: "Nanyang Technological University",
      course: "Computer Science",
      appliedDate: "2024-03-15",
      status: "pending",
      resumeUrl: "/resumes/johndoe.pdf"
    },
    {
      id: "app2",
      applicantId: "user2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      university: "National University of Singapore",
      course: "Information Systems",
      appliedDate: "2024-03-10",
      status: "shortlisted",
      resumeUrl: "/resumes/janesmith.pdf"
    },
    {
      id: "app3",
      applicantId: "user3",
      name: "Michael Wong",
      email: "michael.wong@example.com",
      university: "Singapore Management University",
      course: "Business Information Technology",
      appliedDate: "2024-03-12",
      status: "interview",
      resumeUrl: "/resumes/michaelwong.pdf"
    },
    {
      id: "app4",
      applicantId: "user4",
      name: "Sarah Tan",
      email: "sarah.tan@example.com",
      university: "Singapore Institute of Technology",
      course: "Software Engineering",
      appliedDate: "2024-03-08",
      status: "accepted",
      resumeUrl: "/resumes/sarahtan.pdf"
    },
    {
      id: "app5",
      applicantId: "user5",
      name: "David Lee",
      email: "david.lee@example.com",
      university: "Nanyang Technological University",
      course: "Computer Engineering",
      appliedDate: "2024-03-05",
      status: "rejected",
      resumeUrl: "/resumes/davidlee.pdf"
    }
  ];
  
  const filteredCandidates = filter === "all" 
    ? mockCandidates 
    : mockCandidates.filter(candidate => candidate.status === filter);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{mockJob.title} - Candidates</h1>
          <p className="text-gray-500">{mockJob.company} • {mockJob.location}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Filter:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-500 mb-4">No candidates match the selected filter.</p>
              {filter !== "all" && (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  View All Candidates
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Tabs defaultValue="profile" className="w-full">
                  <div className="bg-gray-50 border-b px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <School className="h-3 w-3 mr-1" /> {candidate.university}
                        </div>
                      </div>
                    </div>
                    <TabsList>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="status">Status</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="profile" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Email</h4>
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-2 text-gray-400" />
                            {candidate.email}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Course</h4>
                          <p>{candidate.course}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Applied On</h4>
                          <p>{candidate.appliedDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end justify-between">
                        <div className="flex space-x-2 mb-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(candidate.resumeUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/employer/messages?applicant=${candidate.applicantId}`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Current Status</h4>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                            ${candidate.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                            ${candidate.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${candidate.status === 'interview' ? 'bg-blue-100 text-blue-800' : ''}
                            ${candidate.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                            ${candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="status" className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Update Candidate Status</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Change the application status to move this candidate through your hiring process.
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <Button 
                            variant={candidate.status === 'pending' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => handleStatusChange(candidate.id, 'pending')}
                          >
                            Pending
                          </Button>
                          <Button 
                            variant={candidate.status === 'shortlisted' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => handleStatusChange(candidate.id, 'shortlisted')}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            variant={candidate.status === 'interview' ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => handleStatusChange(candidate.id, 'interview')}
                          >
                            Interview
                          </Button>
                          <Button 
                            variant={candidate.status === 'accepted' ? 'default' : 'outline'}
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(candidate.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant={candidate.status === 'rejected' ? 'default' : 'outline'}
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => handleStatusChange(candidate.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Communication</h4>
                        <Button 
                          onClick={() => navigate(`/employer/messages?applicant=${candidate.applicantId}`)}
                          className="w-full md:w-auto"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Candidate
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}