import { useState } from 'react';
import { defaultFilters } from '../components/Common/FilterConfig';

const useSearchAndFilter = (fetchFunction) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
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
    setFilters(defaultFilters);
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
