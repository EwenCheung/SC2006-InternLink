import { useState, useEffect } from 'react';

export const useSearchAndFilter = (fetchData, defaultFilters) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    console.log(`Filter changed: ${name} = ${JSON.stringify(value)}`);
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const buildQueryString = () => {
    const queryParams = new URLSearchParams();

    if (searchTerm && searchTerm.trim() !== '') {
      queryParams.append('search', searchTerm);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'stipend' && Array.isArray(value)) {
          queryParams.append('minStipend', value[0]);
          queryParams.append('maxStipend', value[1]);
        } else if (key === 'duration' && Array.isArray(value)) {
          queryParams.append('minDuration', value[0]);
          queryParams.append('maxDuration', value[1]);
        } else if (key === 'course' && Array.isArray(value) && value.length > 0) {
          // Handle multiple course values
          value.forEach(course => {
            queryParams.append('course', course);
          });
        } else if (key === 'payPerHour' && Array.isArray(value)) {
          queryParams.append('minPayPerHour', value[0]);
          queryParams.append('maxPayPerHour', value[1]);
        } else if (Array.isArray(value) && value.length > 0) {
          // Handle other arrays
          queryParams.append(key, value.join(','));
        } else if (value !== '' && (!Array.isArray(value) || (Array.isArray(value) && value.length > 0))) {
          // Handle non-empty values
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString();
    console.log('Built query string:', queryString);
    return queryString;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      console.log('Executing search with filters:', filters);
      const queryString = buildQueryString();
      console.log('Searching with query string:', queryString);
      const newData = await fetchData(queryString);
      console.log('Search results:', newData);
      setData(newData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    console.log('Resetting filters to defaults:', defaultFilters);
    setFilters(defaultFilters);
    setSearchTerm('');
    // Trigger search after resetting filters
    setTimeout(handleSearch, 0);
  };

  // Initial fetch when component mounts
  useEffect(() => {
    handleSearch();
  }, []);
  
  // Search when filters change
  useEffect(() => {
    // Avoid searching on initial render, already handled above
    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // Add debounce of 500ms
    
    return () => clearTimeout(timer);
  }, [filters, searchTerm]);

  return {
    searchTerm,
    filters,
    showFilter,
    loading,
    data,
    handleSearchChange,
    toggleFilter,
    handleFilterChange,
    handleSearch,
    resetFilters,
    setLoading,
    setData
  };
};
