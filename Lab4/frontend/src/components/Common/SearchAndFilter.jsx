import React from 'react';
import styles from './SearchAndFilter.module.css';
import RangeSlider from './RangeSlider';
import FieldCourseSelector from './FieldCourseSelector';
import { FIELDS_AND_COURSES } from './FilterConfig';

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
  const handleFilterChange = (key, value) => {
    onFilterChange({
      target: {
        name: key,
        value: value
      }
    });
  };

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
                  {options.type === 'range' ? (
                    <RangeSlider
                      value={filters[key]}
                      onChange={(value) => handleFilterChange(key, value)}
                      min={options.min}
                      max={options.max}
                      type={key === 'duration' ? 'months' : 'money'}
                      step={options.step || (key === 'duration' ? 1 : (key === 'payPerHour' ? 1 : 100))}
                    />
                  ) : options.type === 'fieldCourse' ? (
                    <FieldCourseSelector
                      selectedCourses={filters[key]}
                      onChange={(selectedCourses) => handleFilterChange(key, selectedCourses)}
                      fieldsAndCourses={FIELDS_AND_COURSES}
                    />
                  ) : (
                    <select 
                      name={key} 
                      value={filters[key]} 
                      onChange={onFilterChange}
                    >
                      <option value="">{options.defaultOption}</option>
                      {options.choices?.map(choice => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  )}
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
