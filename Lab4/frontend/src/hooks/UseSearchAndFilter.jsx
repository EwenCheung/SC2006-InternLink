import { useState } from 'react';

const useSearchAndFilter = (fetchFunction, initialFilters) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters || {});
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSearch = async () => {
    setShowFilter(false);
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm,
      }).toString();
      
      const result = await fetchFunction(queryParams);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
    handleSearch();
  };

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

export { useSearchAndFilter };
