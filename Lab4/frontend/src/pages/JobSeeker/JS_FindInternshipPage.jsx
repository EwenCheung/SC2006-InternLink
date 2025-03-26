import React, { useState, useEffect } from 'react';
import styles from './JS_FindInternshipPage.module.css';
import NavigationBar from '../../components/Layout/Navigation/NavigationBar';

const JS_FindInternshipPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', course: '', year: '', stipend: '', duration: '' });
  const [showFilter, setShowFilter] = useState(false);

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs?jobType=internship&status=active'); // Fetch only active internships
        const data = await response.json();
        console.log('Fetched jobs:', data); // Debugging log
        if (data.success && Array.isArray(data.data)) {
          setJobs(data.data);
        } else {
          console.error('Unexpected API response format:', data);
          setJobs([]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter toggle
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Apply filters and search
  const handleSearch = async () => {
    setShowFilter(false);
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/jobs?jobType=internship&status=active&${query}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        console.error('Unexpected API response format:', data);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching filtered jobs:', error);
    }
  };

  const resetFilters = () => {
    setFilters({ location: '', course: '', year: '', stipend: '', duration: '' });
    handleSearch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchAndFilter}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search for internships..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              Search
            </button>
          </div>
          <button className={styles.filterBtn} onClick={toggleFilter}>
            {showFilter ? 'Close Filter' : 'Open Filter'}
          </button>
        </div>
        {showFilter && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterContent}>
              <div className={styles.filterSection}>
                <h3>Location</h3>
                <select name="location" onChange={handleFilterChange}>
                  <option value="">All Locations</option>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                  <option value="central">Central</option>
                </select>
              </div>
              <div className={styles.filterSection}>
                <h3>Course</h3>
                <select name="course" onChange={handleFilterChange}>
                  <option value="">All Courses</option>
                  <option value="cs">Computer Science</option>
                  <option value="ee">Electrical Engineering</option>
                  <option value="me">Mechanical Engineering</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className={styles.filterSection}>
                <h3>Year of Study</h3>
                <select name="year" onChange={handleFilterChange}>
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
              <div className={styles.filterSection}>
                <h3>Stipend</h3>
                <select name="stipend" onChange={handleFilterChange}>
                  <option value="">All Stipends</option>
                  <option value="low">Below $500</option>
                  <option value="medium">$500 - $1000</option>
                  <option value="high">Above $1000</option>
                </select>
              </div>
              <div className={styles.filterSection}>
                <h3>Duration</h3>
                <select name="duration" onChange={handleFilterChange}>
                  <option value="">All Durations</option>
                  <option value="short">Less than 3 months</option>
                  <option value="medium">3-6 months</option>
                  <option value="long">More than 6 months</option>
                </select>
              </div>
            </div>
            <button className={styles.resetBtn} onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
      <div className={styles.jobListings}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.jobBox}>
            {/* Title */}
            <h3 className={styles.jobTitle}>{job.title}</h3>
            
            {/* Subtitle */}
            <p className={styles.jobCompany}>
              {job.company} - {job.location}
            </p>
            
            {/* Description */}
            <p className={styles.jobDescription}><strong>Job Description:</strong><br /> {job.description}</p>
            
            {/* Job Requirements */}
            <div className={styles.jobRequirements}>
              <span className={styles.duration}>⏱️ {job.duration}</span>
              {job.stipend && <span className={styles.salary}>💰 {job.stipend}</span>}
              {job.requirements && <span>{job.requirements}</span>}
            </div>
            
            {/* View Details Button */}
            <div className={styles.buttonContainer}>
              <button className={styles.seeDetailsBtn}>View Details</button>
            </div>
          </div>
        ))}
      </div>
      <button className={styles.viewApplicationBtn}>View Application</button>
    </div>
  );
};

export default JS_FindInternshipPage;
