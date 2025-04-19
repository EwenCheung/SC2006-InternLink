import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './FieldCourseSelector.module.css';

const FieldCourseSelector = ({ selectedCourses, onChange, fieldsAndCourses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFields, setFilteredFields] = useState(fieldsAndCourses);
  const [expandedFields, setExpandedFields] = useState({});
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize expandedFields on first render
  useEffect(() => {
    const initialExpandedState = {};
    Object.keys(fieldsAndCourses).forEach(field => {
      initialExpandedState[field] = false;
    });
    setExpandedFields(initialExpandedState);
  }, [fieldsAndCourses]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter fields and courses based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFields(fieldsAndCourses);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredData = {};

    Object.entries(fieldsAndCourses).forEach(([field, courses]) => {
      // Check if field matches search
      const fieldMatches = field.toLowerCase().includes(lowerSearchTerm);
      
      // Filter courses that match search term
      const matchingCourses = courses.filter(course => 
        course.toLowerCase().includes(lowerSearchTerm)
      );

      // Include field if it matches or has matching courses
      if (fieldMatches || matchingCourses.length > 0) {
        filteredData[field] = matchingCourses;
        
        // Auto-expand fields with matching courses when searching
        if (searchTerm && (fieldMatches || matchingCourses.length > 0)) {
          setExpandedFields(prev => ({
            ...prev,
            [field]: true
          }));
        }
      }
    });

    setFilteredFields(filteredData);
  }, [searchTerm, fieldsAndCourses]);

  const toggleField = (field) => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const selectAllInField = (field, courses) => {
    const coursesToAdd = courses.filter(course => !selectedCourses.includes(course));
    if (coursesToAdd.length > 0) {
      onChange([...selectedCourses, ...coursesToAdd]);
    } else {
      // If all courses in the field are already selected, deselect them all
      onChange(selectedCourses.filter(course => !courses.includes(course)));
    }
  };

  const toggleCourse = (course) => {
    if (selectedCourses.includes(course)) {
      onChange(selectedCourses.filter(c => c !== course));
    } else {
      onChange([...selectedCourses, course]);
    }
  };

  const removeCourse = (course) => {
    onChange(selectedCourses.filter(c => c !== course));
  };

  const isAllFieldSelected = (field, courses) => {
    return courses.length > 0 && courses.every(course => selectedCourses.includes(course));
  };

  const getFieldSelectionCount = (field, courses) => {
    return courses.filter(course => selectedCourses.includes(course)).length;
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Group selected courses by field
  const getSelectedCoursesGrouped = () => {
    const groupedSelections = {};
    
    // Group courses by their fields
    selectedCourses.forEach(course => {
      for (const [field, courses] of Object.entries(fieldsAndCourses)) {
        if (courses.includes(course)) {
          if (!groupedSelections[field]) {
            groupedSelections[field] = [];
          }
          groupedSelections[field].push(course);
          break;
        }
      }
    });

    return groupedSelections;
  };

  const selectedGrouped = getSelectedCoursesGrouped();

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Display selected courses as bubbles */}
      {selectedCourses.length > 0 && (
        <div className={styles.selectedBubbles}>
          {Object.entries(selectedGrouped).map(([field, courses]) => {
            // If all courses in a field are selected, show the field name instead
            const allSelected = isAllFieldSelected(field, fieldsAndCourses[field]);
            
            if (allSelected) {
              return (
                <div key={field} className={styles.fieldBubble}>
                  <span>{field}</span>
                  <button
                    type="button"
                    onClick={() => selectAllInField(field, fieldsAndCourses[field])}
                    className={styles.removeBubble}
                    aria-label={`Remove ${field}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            }
            
            // Otherwise show individual course bubbles
            return courses.map(course => (
              <div key={course} className={styles.courseBubble}>
                <span>{course}</span>
                <button
                  type="button"
                  onClick={() => removeCourse(course)}
                  className={styles.removeBubble}
                  aria-label={`Remove ${course}`}
                >
                  <FaTimes />
                </button>
              </div>
            ));
          })}
        </div>
      )}

      {/* Selector dropdown trigger */}
      <div 
        className={styles.selector} 
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.placeholder}>
          {selectedCourses.length === 0 
            ? "Select courses..." 
            : `${selectedCourses.length} course${selectedCourses.length !== 1 ? 's' : ''} selected`}
        </div>
        <div className={styles.dropdownIcon}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Search box */}
          <div className={styles.searchBox}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSearch();
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Fields and courses list */}
          <div className={styles.optionsList}>
            {Object.entries(filteredFields).length > 0 ? (
              Object.entries(filteredFields).map(([field, courses]) => (
                <div key={field} className={styles.fieldGroup}>
                  {/* Field header with checkbox */}
                  <div 
                    className={styles.fieldHeader} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleField(field);
                    }}
                  >
                    <div className={styles.fieldCheckbox}>
                      <input
                        type="checkbox"
                        id={`field-${field}`}
                        checked={isAllFieldSelected(field, courses)}
                        onChange={(e) => {
                          e.stopPropagation();
                          selectAllInField(field, courses);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label 
                        htmlFor={`field-${field}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {field}
                      </label>
                    </div>
                    <div className={styles.fieldInfo}>
                      <span className={styles.selectionCount}>
                        {getFieldSelectionCount(field, courses)}/{courses.length}
                      </span>
                      <span className={styles.expandIcon}>
                        {expandedFields[field] ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                  </div>

                  {/* Courses list */}
                  {expandedFields[field] && (
                    <div className={styles.coursesList}>
                      {courses.map(course => (
                        <div
                          key={course}
                          className={styles.courseItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCourse(course);
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`course-${course}`}
                            checked={selectedCourses.includes(course)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleCourse(course);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label 
                            htmlFor={`course-${course}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {course}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                No courses match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldCourseSelector;