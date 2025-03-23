import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../../components/layout/NavigationBar";
import "./FindPage.css";

export default function FindInternshipPage() {
  const [jobs, setJobs] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - replace with API call
  useEffect(() => {
    // This would be your API call to fetch internships
    const mockJobs = [
      {
        id: "INT001",
        title: "Software Engineering Intern",
        company: "Tech Solutions Pte Ltd",
        location: "Singapore",
        duration: "6 months",
        salary: "$1000 - $1500/month",
        description: "Join our dynamic team to develop cutting-edge web applications using modern technologies.",
        requirements: [
          "Currently pursuing Computer Science or related degree",
          "Knowledge of JavaScript, React, and Node.js",
          "Strong problem-solving skills"
        ],
        postedDate: "2024-03-15"
      },
      {
        id: "INT002",
        title: "Data Analytics Intern",
        company: "DataViz Corp",
        location: "Singapore",
        duration: "3 months",
        salary: "$1200/month",
        description: "Help analyze large datasets and create meaningful visualizations for business insights.",
        requirements: [
          "Background in Data Science, Statistics, or related field",
          "Experience with Python and SQL",
          "Knowledge of data visualization tools"
        ],
        postedDate: "2024-03-14"
      }
    ];
    setJobs(mockJobs);
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // Implement search functionality
  };
  
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  return (
    <>
      <NavigationBar userRole="jobseeker" />
      <div className="find-page-container">
        <div className="search-and-filter">
          <div className="search-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search for internships..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <button className="filter-btn" onClick={toggleFilter}>Filter</button>
          </div>
          
          {showFilter && (
            <div className="filter-dropdown" id="filterDropdown">
              <div className="filter-content">
                <div className="filter-section">
                  <h3>Location</h3>
                  <select>
                    <option value="">All Locations</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                    <option value="central">Central</option>
                  </select>
                </div>
                <div className="filter-section">
                  <h3>Course</h3>
                  <select>
                    <option value="">All Courses</option>
                    <option value="cs">Computer Science</option>
                    <option value="ee">Electrical Engineering</option>
                    <option value="me">Mechanical Engineering</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="filter-section">
                  <h3>Year of Study</h3>
                  <select>
                    <option value="">All Years</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="job-listings">
          {jobs.map(job => (
            <div className="job-box" key={job.id}>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-description">{job.description}</p>
              <div className="job-requirements">
                <span className="location">📍 {job.location}</span>
                <span className="duration">⏱️ {job.duration}</span>
                <span className="salary">💰 {job.salary}</span>
              </div>
              <div className="job-action">
                <span className="posted-date">Posted: {job.postedDate}</span>
                <Link to={`/jobseeker/job-details/${job.id}`} className="see-details-btn">
                  See Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
