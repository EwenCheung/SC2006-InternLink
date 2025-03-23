import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../../components/layout/NavigationBar";
import "./FindPage.css";

export default function FindAdhocPage() {
  const [adhocJobs, setAdhocJobs] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - replace with API call
  useEffect(() => {
    // This would be your API call to fetch adhoc
    const mockAdhocJobs = [
      {
        id: "ADH001",
        title: "Weekend UI Design Project",
        company: "Creative Solutions",
        location: "Singapore (Remote)",
        duration: "2 days",
        compensation: "$200 flat rate",
        description: "Help design UI mockups for a new mobile application. Perfect weekend project for design students.",
        requirements: [
          "UI/UX design experience",
          "Proficient in Figma or Adobe XD",
          "Available this weekend"
        ],
        postedDate: "2024-03-22"
      },
      {
        id: "ADH002",
        title: "Marketing Campaign Assistant",
        company: "BrandBoost Agency",
        location: "Central Singapore",
        duration: "1 week",
        compensation: "$500 for project completion",
        description: "Assist our marketing team with an upcoming product launch campaign. Tasks include content creation and social media management.",
        requirements: [
          "Marketing or Communications background",
          "Creative writing skills",
          "Social media savvy"
        ],
        postedDate: "2024-03-20"
      },
      {
        id: "ADH003",
        title: "Data Entry & Analysis",
        company: "ResearchTech Ltd",
        location: "East Singapore (Hybrid)",
        duration: "3 days",
        compensation: "$100/day",
        description: "Help compile and analyze research data for a market study. Requires attention to detail and basic statistical knowledge.",
        requirements: [
          "Proficient in Excel",
          "Detail-oriented",
          "Basic understanding of data analysis"
        ],
        postedDate: "2024-03-21"
      }
    ];
    setAdhocJobs(mockAdhocJobs);
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for adhoc opportunities:", searchTerm);
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
                placeholder="Search for adhoc opportunities..." 
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
                  <h3>Duration</h3>
                  <select>
                    <option value="">Any Duration</option>
                    <option value="1day">1 Day</option>
                    <option value="weekend">Weekend</option>
                    <option value="1week">Up to 1 Week</option>
                    <option value="2weeks">Up to 2 Weeks</option>
                  </select>
                </div>
                <div className="filter-section">
                  <h3>Location</h3>
                  <select>
                    <option value="">All Locations</option>
                    <option value="remote">Remote</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                    <option value="central">Central</option>
                  </select>
                </div>
                <div className="filter-section">
                  <h3>Type of Work</h3>
                  <select>
                    <option value="">All Types</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="data">Data</option>
                    <option value="development">Development</option>
                    <option value="event">Event Management</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="job-listings">
          {adhocJobs.map(job => (
            <div className="job-box" key={job.id}>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-description">{job.description}</p>
              <div className="job-requirements">
                <span className="location">📍 {job.location}</span>
                <span className="duration">⏱️ {job.duration}</span>
                <span className="compensation">💰 {job.compensation}</span>
              </div>
              <div className="job-action">
                <span className="posted-date">Posted: {job.postedDate}</span>
                <Link to={`/jobseeker/adhoc-job-details/${job.id}`} className="see-details-btn">
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