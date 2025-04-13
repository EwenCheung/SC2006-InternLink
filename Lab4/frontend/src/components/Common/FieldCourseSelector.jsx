import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import styles from './FieldCourseSelector.module.css';

const FIELDS_AND_COURSES = {
  "Computer Science & IT": [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Information Systems",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data Science",
    "Computer Graphics",
    "Computer Networking",
    "Human-Computer Interaction",
    "Machine Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Quantum Computing",
    "Cloud Computing",
    "Internet of Things (IoT)",
    "Blockchain Technology",
    "Augmented Reality",
    "Virtual Reality"
  ],
  "Business & Analytics": [
    "Business Administration",
    "Business Analytics",
    "Marketing Analytics",
    "Financial Analytics",
    "Business Intelligence",
    "Operations Management",
    "Management Information Systems",
    "Supply Chain Analytics",
    "Accounting",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Entrepreneurship",
    "Economics",
    "E-commerce",
    "Organizational Behavior",
    "Strategic Management",
    "Project Management"
  ],
  "Engineering": [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
    "Environmental Engineering",
    "Aerospace Engineering",
    "Materials Engineering",
    "Industrial Engineering",
    "Nuclear Engineering",
    "Petroleum Engineering",
    "Automotive Engineering",
    "Marine Engineering",
    "Mechatronics Engineering",
    "Structural Engineering",
    "Telecommunications Engineering",
    "Systems Engineering",
    "Geotechnical Engineering"
  ],
  "Natural Sciences": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Statistics",
    "Environmental Science",
    "Biotechnology",
    "Neuroscience",
    "Geology",
    "Astronomy",
    "Oceanography",
    "Meteorology",
    "Ecology",
    "Zoology",
    "Botany",
    "Genetics",
    "Microbiology",
    "Paleontology",
    "Astrophysics"
  ],
  "Social Sciences & Humanities": [
    "Psychology",
    "Economics",
    "Sociology",
    "Political Science",
    "Communication Studies",
    "Linguistics",
    "History",
    "Philosophy",
    "International Relations",
    "Anthropology",
    "Archaeology",
    "Religious Studies",
    "Cultural Studies",
    "Gender Studies",
    "Human Geography",
    "Education",
    "Law",
    "Social Work",
    "Criminology"
  ],
  "Design & Media": [
    "Digital Media",
    "Graphic Design",
    "User Experience Design",
    "Animation",
    "Game Design",
    "Music Technology",
    "Film Studies",
    "Fashion Design",
    "Interior Design",
    "Industrial Design",
    "Photography",
    "Visual Arts",
    "Performing Arts",
    "Theatre Studies",
    "Sound Design",
    "Media Production",
    "Advertising",
    "Public Relations",
    "Journalism"
  ],
  "Health & Medical Sciences": [
    "Medicine",
    "Nursing",
    "Pharmacy",
    "Dentistry",
    "Public Health",
    "Physiotherapy",
    "Occupational Therapy",
    "Nutrition and Dietetics",
    "Biomedical Science",
    "Veterinary Medicine",
    "Radiography",
    "Speech and Language Therapy",
    "Optometry",
    "Midwifery",
    "Medical Laboratory Science",
    "Health Informatics",
    "Clinical Psychology",
    "Epidemiology",
    "Genetic Counseling"
  ],
  "Education": [
    "Early Childhood Education",
    "Primary Education",
    "Secondary Education",
    "Special Education",
    "Educational Leadership",
    "Curriculum and Instruction",
    "Educational Technology",
    "Adult Education",
    "Higher Education",
    "Educational Psychology",
    "Counselor Education",
    "Language Education",
    "Mathematics Education",
    "Science Education",
    "Physical Education",
    "Art Education",
    "Music Education",
    "Vocational Education",
    "Instructional Design"
  ],
  "Agriculture & Environmental Studies": [
    "Agricultural Science",
    "Horticulture",
    "Animal Science",
    "Soil Science",
    "Agribusiness",
    "Forestry",
    "Fisheries Science",
    "Wildlife Management",
    "Environmental Management",
    "Sustainable Agriculture",
    "Food Science and Technology",
    "Plant Pathology",
    "Entomology",
    "Agricultural Engineering",
    "Agroecology",
    "Climate Science",
    "Natural Resource Management",
    "Water Resources Management",
    "Rural Development"
  ],
  "Architecture & Built Environment": [
    "Architecture",
    "Urban Planning",
    "Landscape Architecture",
    "Interior Architecture",
    "Construction Management",
    "Quantity Surveying",
    "Building Services Engineering",
    "Real Estate",
    "Sustainable Design",
    "Historic Preservation",
    "Urban Design",
    "Environmental Design",
    "Structural Engineering",
    "Building Information Modeling (BIM)",
    "Housing Studies",
    "Transportation Planning",
    "Regional Planning",
    "Urban Studies",
    "Facility Management"
  ]
};

const FieldCourseSelector = ({ onChange, selectedCourses = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState('All Courses');
  const dropdownRef = useRef(null);
  const [fieldStates, setFieldStates] = useState({});
  const [selectedCoursesState, setSelectedCoursesState] = useState(
    Array.isArray(selectedCourses) ? selectedCourses : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Initialize field states based on which courses are selected
  useEffect(() => {
    const newFieldStates = {};
    Object.entries(FIELDS_AND_COURSES).forEach(([field, courses]) => {
      const coursesInField = selectedCoursesState.filter(course => courses.includes(course));
      newFieldStates[field] = coursesInField.length === courses.length;
    });
    setFieldStates(newFieldStates);
    updateDisplayText();
  }, [selectedCoursesState]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
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

  const updateDisplayText = () => {
    if (selectedCoursesState.length === 0) {
      setDisplayText('All Courses');
    } else if (selectedCoursesState.length === 1) {
      setDisplayText(selectedCoursesState[0]);
    } else {
      // Check if an entire field is selected
      const selectedFields = Object.entries(fieldStates)
        .filter(([_, isSelected]) => isSelected)
        .map(([field]) => field);
      
      if (selectedFields.length === 1) {
        setDisplayText(selectedFields[0]);
      } else if (selectedFields.length > 1) {
        setDisplayText(`${selectedFields.length} fields selected`);
      } else {
        setDisplayText(`${selectedCoursesState.length} courses selected`);
      }
    }
  };

  const handleFieldToggle = (field) => {
    const courses = FIELDS_AND_COURSES[field];
    let newSelection = [...selectedCoursesState];
    
    if (fieldStates[field]) {
      // If field is checked, remove all its courses
      newSelection = newSelection.filter(course => !courses.includes(course));
    } else {
      // If field is not checked, add all its courses that aren't already selected
      courses.forEach(course => {
        if (!newSelection.includes(course)) {
          newSelection.push(course);
        }
      });
    }
    
    setSelectedCoursesState(newSelection);
    onChange(newSelection);
  };

  const handleCourseToggle = (course, field) => {
    let newSelection = [...selectedCoursesState];
    
    if (newSelection.includes(course)) {
      // Remove course
      newSelection = newSelection.filter(c => c !== course);
    } else {
      // Add course
      newSelection.push(course);
    }
    
    // Check if all courses in this field are now selected
    const fieldCourses = FIELDS_AND_COURSES[field];
    const allFieldCoursesSelected = fieldCourses.every(c => 
      newSelection.includes(c)
    );
    
    // Update field state
    setFieldStates(prev => ({
      ...prev,
      [field]: allFieldCoursesSelected
    }));
    
    setSelectedCoursesState(newSelection);
    onChange(newSelection);
  };

  // Filter fields and courses based on search query
  const getFilteredFieldsAndCourses = () => {
    if (!searchQuery.trim()) {
      return Object.entries(FIELDS_AND_COURSES);
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    return Object.entries(FIELDS_AND_COURSES)
      .map(([field, courses]) => {
        // Filter courses that match the search query
        const matchingCourses = courses.filter(course => 
          course.toLowerCase().includes(normalizedQuery)
        );
        
        // Include field if field name matches or if it has matching courses
        const fieldMatches = field.toLowerCase().includes(normalizedQuery);
        
        if (fieldMatches || matchingCourses.length > 0) {
          return [field, matchingCourses];
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  };

  // Clear search when dropdown closes
  const handleDropdownToggle = () => {
    if (isOpen) {
      setSearchQuery('');
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div 
        className={styles.dropdownHeader} 
        onClick={handleDropdownToggle}
      >
        <span className={styles.dropdownText}>{displayText}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {getFilteredFieldsAndCourses().map(([field, courses]) => (
            <div key={field} className={styles.fieldSection}>
              <div 
                className={styles.fieldHeader}
                onClick={() => handleFieldToggle(field)}
              >
                <div className={styles.checkboxContainer}>
                  <div className={`${styles.checkbox} ${fieldStates[field] ? styles.checked : ''}`}>
                    {fieldStates[field] && <FaCheck className={styles.checkIcon} />}
                  </div>
                </div>
                <span className={styles.fieldName}>{field}</span>
              </div>
              
              {courses.length > 0 && (
                <div className={styles.coursesList}>
                  {courses.map(course => (
                    <div 
                      key={course} 
                      className={styles.courseItem}
                      onClick={() => handleCourseToggle(course, field)}
                    >
                      <div className={styles.checkboxContainer}>
                        <div className={`${styles.checkbox} ${selectedCoursesState.includes(course) ? styles.checked : ''}`}>
                          {selectedCoursesState.includes(course) && <FaCheck className={styles.checkIcon} />}
                        </div>
                      </div>
                      <span className={styles.courseName}>{course}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {getFilteredFieldsAndCourses().length === 0 && (
            <div className={styles.noResults}>
              No courses found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldCourseSelector;