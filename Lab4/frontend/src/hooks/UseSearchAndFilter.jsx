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
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const buildQueryString = () => {
    const queryParams = new URLSearchParams();

    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'stipend' && Array.isArray(value)) {
          queryParams.append('minStipend', value[0]);
          queryParams.append('maxStipend', value[1]);
        } else {
          queryParams.append(key, value);
        }
      }
    });

    return queryParams.toString();
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const newData = await fetchData(queryString);
      setData(newData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
  };

  // Initial fetch when component mounts or filters change
  useEffect(() => {
    handleSearch();
  }, [filters]);

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
