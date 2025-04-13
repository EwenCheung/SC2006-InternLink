import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaClock, FaUsers, FaSearch, FaSpinner } from 'react-icons/fa';
import styles from './JS_FindInternshipPage.module.css';
import SearchAndFilter from '../../components/Common/SearchAndFilter';
import { internshipFilterOptions, defaultInternshipFilters } from '../../components/Common/FilterConfig';
import { useSearchAndFilter } from '../../hooks/UseSearchAndFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_FindInternshipPage = () => {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(false); 

  const fetchJobs = async (queryParams) => {
    try {
      console.log(`Fetching internship jobs with params: ${queryParams}`);
      
      // If empty queryParams, load all jobs
      const endpoint = queryParams ? 
        `${API_BASE_URL}/api/jobs/internship?${queryParams}` : 
        `${API_BASE_URL}/api/jobs/internship/all`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        console.log(`Fetched ${data.data.length} internships`);
        // Filter out any jobs with status that isn't 'posted'
        const activeJobs = data.data.filter(job => job.status === 'posted');
        return activeJobs;
      } else {
        console.error('Unexpected data format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      return [];
    }
  };

  const {
    searchTerm,
    filters,
    showFilter,
    loading,
    data: jobs,
    handleSearchChange,
    toggleFilter,
    handleFilterChange,
    handleSearch,
    resetFilters,
    setLoading
  } = useSearchAndFilter(fetchJobs, defaultInternshipFilters);

  const handleViewDetails = (jobId) => {
    navigate(`/jobseeker/internship/${jobId}`);
  };

  const renderTags = (job) => {
    const allTags = job.tags || [];
    const displayCount = 3;

    if (allTags.length === 0) return null;

    const visibleTags = allTags.slice(0, displayCount);
    const remainingCount = allTags.length - displayCount;

    return (
      <div className={styles.tagSection}>
        {visibleTags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className={styles.moreTag}>
            +{remainingCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className={styles.searchAndFilterContainer}>
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          showFilter={showFilter}
          toggleFilter={toggleFilter}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          filterOptions={internshipFilterOptions}
        />
      </div>

      <div className={styles.container}>
        <div className={styles.jobListings}>
          {loading ? (
            <div className={styles.loadingState}>
              <FaSpinner className={styles.loadingIcon} />
              <div className={styles.loadingMessage}>Loading internships...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <FaSearch className={styles.emptyStateIcon} />
              <div className={styles.emptyStateMessage}>No internships found</div>
              <div className={styles.emptyStateSubtext}>Try different search terms or filters</div>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className={styles.jobBox}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                
                <div className={styles.companyInfo}>
                  <FaBuilding />
                  <span>{job.company}</span>
                </div>
                
                <div className={styles.locationInfo}>
                  <FaMapMarkerAlt />
                  <span>{job.location}</span>
                </div>

                <div className={styles.jobDescription}>
                  <strong>Job Description:</strong><br />
                  {job.description}
                </div>

                {renderTags(job)}

                <div className={styles.jobDetails}>
                  <div className={styles.stipendInfo}>
                    <span>$ SGD {job.stipend}/month</span>
                  </div>
                  
                  {job.yearOfStudy && (
                    <div className={styles.detailItem}>
                      <FaGraduationCap />
                      <span>{job.yearOfStudy}</span>
                    </div>
                  )}

                  {job.duration && (
                    <div className={styles.detailItem}>
                      <FaClock />
                      <span>{job.duration}</span>
                    </div>
                  )}

                  {job.positions && (
                    <div className={styles.detailItem}>
                      <FaUsers />
                      <span>{job.positions} positions</span>
                    </div>
                  )}
                </div>

                <div className={styles.buttonContainer}>
                  <button 
                    className={styles.seeDetailsBtn}
                    onClick={() => handleViewDetails(job._id)}
                  >
                    View Job Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button 
          className={styles.viewApplicationBtn}
          onClick={() => {
            try {
              // Get jobseeker ID from localStorage
              const user = localStorage.getItem('user');
              if (user) {
                const userData = JSON.parse(user);
                const jobseekerID = userData._id;
                // Navigate to applications with jobseeker ID
                navigate(`/jobseeker/applications/${jobseekerID}`);
              } else {
                // If no user found, just navigate to applications
                navigate('/jobseeker/applications');
              }
            } catch (error) {
              console.error('Error parsing user data:', error);
              // Fallback to simple navigation
              navigate('/jobseeker/applications');
            }
          }}
        >
          View Applications
        </button>
      </div>
    </div>
  );
};

export default JS_FindInternshipPage;
