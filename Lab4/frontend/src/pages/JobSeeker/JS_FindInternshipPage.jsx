import React, { useEffect } from 'react';
import styles from './JS_FindInternshipPage.module.css';
import SearchAndFilter from '../../components/Common/SearchAndFilter';
import { internshipFilterOptions, defaultInternshipFilters } from '../../components/Common/FilterConfig';
import { useSearchAndFilter } from '../../hooks/UseSearchAndFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'; // Use environment variable or default to port 5001

const JS_FindInternshipPage = () => {
  const fetchJobs = async (queryParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship?${queryParams}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('API Response:', data); // Debugging: Log the API response
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        throw new Error('Failed to fetch jobs');
      } else {
        const text = await response.text();
        console.error('Non-JSON Response:', text); // Debugging: Log non-JSON response
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

  // Initial fetch
  useEffect(() => {
    const fetchInitialJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/jobs/internship`);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Initial Fetch Response:', data); // Debugging: Log the initial fetch response
          if (data.success && Array.isArray(data.data)) {
            setJobs(data.data);
          } else {
            console.error('Unexpected API response format:', data);
            setJobs([]);
          }
        } else {
          const text = await response.text();
          console.error('Non-JSON Initial Response:', text); // Debugging: Log non-JSON response
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
              <div key={job._id} className={styles.jobBox}> {/* Updated key to use job._id */}
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.jobCompany}>
                  {job.company} - {job.location}
                </p>
                <p className={styles.jobDescription}>
                  <strong>Job Description:</strong><br />
                  {job.description}
                </p>
                <div className={styles.jobRequirements}>
                  <span>⏱️ {job.duration}</span>
                  {job.stipend && <span>💰 {job.stipend}</span>}
                  {job.requirements && <span>{job.requirements}</span>}
                </div>
                <div className={styles.buttonContainer}>
                  <button className={styles.seeDetailsBtn}>View Details</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button className={styles.viewApplicationBtn}>
          View Applications
        </button>
      </div>
    </div>
  );
};

export default JS_FindInternshipPage;
