import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EP_PostInternshipPage.module.css';
import SearchAndFilter from '../../components/Common/SearchAndFilter';
import { internshipFilterOptions, defaultInternshipFilters } from '../../components/Common/FilterConfig';
import { useSearchAndFilter } from '../../hooks/UseSearchAndFilter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const EP_PostInternshipPage = () => {
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState('');

  // Check authentication and role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token || userRole !== 'employer') {
      navigate('/employer/login');
    }
  }, [navigate]);

  const fetchJobs = async (queryParams) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship/my-posts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/employer/login');
          return [];
        }
        throw new Error('Failed to fetch jobs');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        throw new Error('Failed to fetch jobs');
      } else {
        const text = await response.text();
        console.error('Non-JSON Response:', text);
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/jobs/internship/my-posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/employer/login');
            return;
          }
          throw new Error('Failed to fetch jobs');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setJobs(data.data);
          } else {
            console.error('Unexpected API response format:', data);
            setJobs([]);
          }
        } else {
          const text = await response.text();
          console.error('Non-JSON Initial Response:', text);
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
  }, [setLoading, setJobs, navigate]);

  const handlePostNew = () => {
    navigate('/employer/add-internship');
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/internship/${jobId}/edit`);
  };

  const handleDelete = async (jobId) => {
    try {
      setDeleteError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/employer/login');
          return;
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete post');
      }

      // Remove the deleted job from the list
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (err) {
      setDeleteError(err.message || 'An error occurred while deleting the post');
    }
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/employer/view-applicants/${jobId}`);
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

      {deleteError && (
        <div className={styles.error}>
          {deleteError}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.jobListings}>
          {loading ? (
            <div>Loading...</div>
          ) : jobs.length === 0 ? (
            <div>No internship posts found</div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className={`${styles.jobBox} ${job.status === 'draft' ? styles.draftJob : ''}`}>
                {job.status === 'draft' && (
                  <div className={styles.draftBadge}>Draft</div>
                )}
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
                  <button 
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => handleDelete(job._id)}
                  >
                    {job.status === 'draft' ? 'Delete Draft' : 'Delete Post'}
                  </button>
                  <button 
                    className={`${styles.button} ${styles.editButton}`}
                    onClick={() => handleEdit(job._id)}
                  >
                    {job.status === 'draft' ? 'Edit Draft' : 'Edit Details'}
                  </button>
                  {job.status === 'posted' && (
                    <button 
                      className={`${styles.button} ${styles.viewButton}`}
                      onClick={() => handleViewApplicants(job._id)}
                    >
                      View Applicants
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <button 
          className={styles.postNewBtn}
          onClick={handlePostNew}
        >
          Post New Internship
        </button>
      </div>
    </div>
  );
};

export default EP_PostInternshipPage;
