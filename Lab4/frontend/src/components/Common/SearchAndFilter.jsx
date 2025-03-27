import React from 'react';
import styles from './SearchAndFilter.module.css';

const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch, 
  showFilter, 
  toggleFilter, 
  filters, 
  onFilterChange,
  onReset,
  filterOptions
}) => {
  return (
    <div className={styles.searchAndFilterContainer}>
      <div className={styles.searchAndFilter}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={onSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
            <div className={styles.searchButtonContainer}>
              <button className={styles.searchBtn} onClick={onSearch}>
                Search
              </button>
            </div>
            <div className={styles.filterButtonContainer}>
              <button className={styles.filterBtn} onClick={toggleFilter}>
                {showFilter ? 'Close Filter' : 'Filter'}
              </button>
            </div>
          </div>
        </div>
        
        {showFilter && (
          <div className={styles.filterDropdown}>
            <div className={styles.filterContent}>
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key} className={styles.filterSection}>
                  <h3>{options.label}</h3>
                  <select 
                    name={key} 
                    value={filters[key]} 
                    onChange={onFilterChange}
                  >
                    <option value="">{options.defaultOption}</option>
                    {options.choices.map(choice => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button className={styles.resetBtn} onClick={onReset}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
