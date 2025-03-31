import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './CourseSelector.module.css';

const CourseSelector = ({ coursesByCategory, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleCategoryToggle = (category) => {
    const coursesInCategory = coursesByCategory[category];
    const allCategoryCoursesSelected = coursesInCategory.every(course => 
      selected.includes(course)
    );

    if (allCategoryCoursesSelected) {
      onChange(selected.filter(item => !coursesInCategory.includes(item)));
    } else {
      const newCourses = coursesInCategory.filter(course => !selected.includes(course));
      onChange([...selected, ...newCourses]);
    }
  };

  const handleCourseToggle = (course) => {
    if (selected.includes(course)) {
      onChange(selected.filter(item => item !== course));
    } else {
      onChange([...selected, course]);
    }
  };

  const removeSelection = (course) => {
    onChange(selected.filter(item => item !== course));
  };

  const isCategoryFullySelected = (category) => {
    const coursesInCategory = coursesByCategory[category];
    return coursesInCategory && coursesInCategory.length > 0 && 
           coursesInCategory.every(course => selected.includes(course));
  };

  const getSelectedCategories = () => {
    return Object.keys(coursesByCategory).filter(category => {
      const coursesInCategory = coursesByCategory[category];
      return coursesInCategory && coursesInCategory.some(course => selected.includes(course));
    });
  };

  const getSelectedDisplay = () => {
    const categories = getSelectedCategories();
    return categories.map(category => {
      const coursesInCategory = coursesByCategory[category];
      const allSelected = isCategoryFullySelected(category);
      if (allSelected) {
        return (
          <div key={category} className={styles.selectedItem}>
            {category}
            <button
              type="button"
              className={styles.removeItem}
              onClick={(e) => { 
                e.stopPropagation();
                handleCategoryToggle(category);
              }}
              aria-label={`Remove ${category}`}
            >
              <FaTimes />
            </button>
          </div>
        );
      }
      return coursesInCategory
        .filter(course => selected.includes(course))
        .map(course => (
          <div key={course} className={styles.selectedItem}>
            {course}
            <button
              type="button"
              className={styles.removeItem}
              onClick={(e) => {
                e.stopPropagation();
                removeSelection(course);
              }}
              aria-label={`Remove ${course}`}
            >
              <FaTimes />
            </button>
          </div>
        ));
    });
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div 
        className={styles.selectField}
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
        aria-haspopup="true"
      >
        <div className={styles.selectedItems}>
          {selected.length > 0 ? getSelectedDisplay() : (
            <div className={styles.emptyBubble}>
              Select required courses of study...
            </div>
          )}
        </div>
        <div className={styles.toggleIcon}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {isOpen && (
        <div 
          className={styles.dropdownMenu}
          role="listbox"
        >
          {Object.entries(coursesByCategory).map(([category, courses]) => (
            <div key={category} className={styles.categoryGroup}>
              <label 
                className={styles.categoryLabel}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isCategoryFullySelected(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.courseCount}>
                  ({courses.length})
                </span>
              </label>
              <div className={styles.courseList}>
                {courses.map(course => (
                  <label 
                    key={course} 
                    className={styles.courseLabel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                    />
                    <span className={styles.courseName}>{course}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSelector;
