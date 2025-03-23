import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import NavigationBar from "../../components/layout/NavigationBar";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter 
} from "lucide-react";
import "./PostPage.css";

export default function PostAdHocPage() {
  const navigate = useNavigate();
  const [adhocJobs, setAdhocJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    compensation: "",
    duration: "",
  });
  
  useEffect(() => {
    // Fetch ad-hoc job posts from API
    const fetchAdhocJobs = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch("/api/jobs?type=adhoc&employer=currentUserId");
        // const data = await response.json();
        // setAdhocJobs(data.data);
        
        // Mock data
        setTimeout(() => {
          setAdhocJobs([
            {
              id: "adh001",
              title: "Weekend Marketing Assistant",
              company: "Tech Solutions Pte Ltd",
              location: "Singapore",
              duration: "2 days",
              compensation: "$200 flat rate",
              applicantsCount: 5,
              postedDate: "2024-03-10"
            },
            {
              id: "adh002",
              title: "Data Entry Project",
              company: "Tech Solutions Pte Ltd",
              location: "Remote",
              duration: "1 week",
              compensation: "$500 for project completion",
              applicantsCount: 3,
              postedDate: "2024-03-12"
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching ad-hoc jobs:", error);
        toast.error("Failed to load ad-hoc jobs");
        setLoading(false);
      }
    };
    
    fetchAdhocJobs();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic
    toast.info(`Searching for: ${searchTerm}`);
  };
  
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.title || !formData.location || !formData.description || !formData.duration) {
        return toast.error("Please fill all required fields");
      }
      
      // Format requirements as an array
      const requirements = formData.requirements
        .split('\n')
        .filter(req => req.trim() !== '');
      
      const newAdhocJob = {
        ...formData,
        requirements,
        jobType: "adhoc",
        postedDate: new Date().toISOString().split('T')[0]
      };
      
      // Replace with actual API call
      // const response = await fetch("/api/jobs", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(newAdhocJob)
      // });
      // const data = await response.json();
      
      // Mock successful creation
      toast.success("Ad-hoc job posted successfully!");
      setShowCreateForm(false);
      
      // Add to list with a mock ID
      setAdhocJobs([
        {
          id: `adh00${adhocJobs.length + 1}`,
          ...newAdhocJob,
          applicantsCount: 0
        },
        ...adhocJobs
      ]);
      
      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        compensation: "",
        duration: "",
      });
    } catch (error) {
      console.error("Error creating ad-hoc job:", error);
      toast.error("Failed to post ad-hoc job");
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // Replace with actual API call
      // await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      
      // Remove from list
      setAdhocJobs(adhocJobs.filter(job => job.id !== id));
      toast.success("Ad-hoc job posting deleted");
      setShowConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting ad-hoc job:", error);
      toast.error("Failed to delete ad-hoc job");
    }
  };
  
  return (
    <>
      <NavigationBar userRole="employer" />
      <div className="post-page-container">
        <h1>Posted Ad-Hoc Jobs</h1>
        
        <div className="search-and-filter">
          <div className="search-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search your ad-hoc job postings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn" onClick={handleSearch}>
                <Search size={18} />
                Search
              </button>
            </div>
            <button className="filter-btn" onClick={toggleFilter}>
              <Filter size={18} />
              Filter
            </button>
          </div>
          
          {showFilter && (
            <div className="filter-dropdown">
              <div className="filter-content">
                <div className="filter-section">
                  <h3>Duration</h3>
                  <div className="filter-options">
                    <label><input type="checkbox" /> 1-3 days</label>
                    <label><input type="checkbox" /> 4-7 days</label>
                    <label><input type="checkbox" /> 1-2 weeks</label>
                    <label><input type="checkbox" /> 2+ weeks</label>
                  </div>
                </div>
                <div className="filter-section">
                  <h3>Posted Date</h3>
                  <div className="filter-options">
                    <label><input type="checkbox" /> Last 24 hours</label>
                    <label><input type="checkbox" /> Last 7 days</label>
                    <label><input type="checkbox" /> Last 30 days</label>
                  </div>
                </div>
                <div className="filter-section">
                  <h3>Applications</h3>
                  <div className="filter-options">
                    <label><input type="checkbox" /> With applications</label>
                    <label><input type="checkbox" /> No applications yet</label>
                  </div>
                </div>
                <div className="filter-actions">
                  <button className="apply-filter">Apply Filters</button>
                  <button className="reset-filter">Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading">Loading your ad-hoc job postings...</div>
        ) : adhocJobs.length === 0 ? (
          <div className="no-postings">
            <p>You haven't posted any ad-hoc jobs yet.</p>
            <button 
              className="create-posting-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Posting
            </button>
          </div>
        ) : (
          <div className="postings-list">
            {adhocJobs.map(job => (
              <div className="posting-card" key={job.id}>
                <div className="posting-info">
                  <h2>{job.title}</h2>
                  <p className="company-name">{job.company}</p>
                  <div className="posting-details">
                    <span>
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span>
                      <Calendar size={14} />
                      {job.duration}
                    </span>
                    <span>
                      <DollarSign size={14} />
                      {job.compensation}
                    </span>
                  </div>
                  <div className="posting-meta">
                    <span className="applicants-count">
                      {job.applicantsCount} {job.applicantsCount === 1 ? 'Applicant' : 'Applicants'}
                    </span>
                    <span className="posted-date">Posted: {job.postedDate}</span>
                  </div>
                </div>
                <div className="posting-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/employer/adhoc-job-details/${job.id}`)}
                  >
                    View Details
                  </button>
                  <button 
                    className="view-applicants-btn"
                    onClick={() => navigate(`/employer/view-candidates/${job.id}`)}
                  >
                    View Applicants
                  </button>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/employer/edit-adhoc/${job.id}`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => setShowConfirmDelete(job.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="float-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={24} />
          Post Job
        </button>
        
        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-container create-form">
              <h2>Post New Ad-Hoc Job</h2>
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Job Title*</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">Company*</label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location*</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Job Description*</label>
                  <textarea 
                    id="description" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="requirements">Requirements (one per line)*</label>
                  <textarea 
                    id="requirements" 
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Social media skills&#10;Available on weekends&#10;Creative mindset"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="compensation">Compensation*</label>
                    <input 
                      type="text" 
                      id="compensation" 
                      name="compensation"
                      value={formData.compensation}
                      onChange={handleInputChange}
                      placeholder="e.g. $200 flat rate"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="duration">Duration*</label>
                    <input 
                      type="text" 
                      id="duration" 
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g. 2 days"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Post Ad-Hoc Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this ad-hoc job posting? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button 
                  className="delete-confirm-btn"
                  onClick={() => handleDelete(showConfirmDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}