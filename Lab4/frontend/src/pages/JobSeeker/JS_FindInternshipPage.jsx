import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaClock, FaUsers } from 'react-icons/fa';
import styles from './JS_FindInternshipPage.module.css';
import SearchAndFilter from '../../components/Common/SearchAndFilter';
import { internshipFilterOptions, defaultInternshipFilters } from '../../components/Common/FilterConfig';
import { useSearchAndFilter } from '../../hooks/UseSearchAndFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_FindInternshipPage = () => {
  const navigate = useNavigate();

  const fetchJobs = async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship?${queryParams}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        throw new Error('Failed to fetch jobs');
      } else {
        throw new Error('Received non-JSON response');
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      throw error;
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
    setLoading,
    setData: setJobs
  } = useSearchAndFilter(fetchJobs, defaultInternshipFilters);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/jobs/internship`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setJobs(data.data);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialJobs();
  }, [setLoading, setJobs]);

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
            <div>Loading...</div>
          ) : jobs.length === 0 ? (
            <div>No internships found</div>
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
          onClick={() => navigate('/jobseeker/applications')}
        >
          View Applications
        </button>
      </div>
    </div>
  );
};

export default JS_FindInternshipPage;
