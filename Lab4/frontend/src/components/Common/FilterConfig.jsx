import React from 'react';

// Export the FIELDS_AND_COURSES for use in other components
export const FIELDS_AND_COURSES = {
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

// Initial filter configuration with loading state
const locationFilter = {
  label: "Location",
  defaultOption: "Loading locations...",
  choices: [],
  isLoading: true
};

// Update locationFilter after successful fetch
const updateLocationFilter = (locations) => {
  if (locations) {
    locationFilter.choices = locations.map(area => ({
      value: area.pln_area_n.toLowerCase(),
      label: area.pln_area_n
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }));
    locationFilter.defaultOption = "All Locations";
    locationFilter.isLoading = false;
  }
};

// Shared location filter
async function getTokenAndFetchLocation(retryCount = 0) {
  try {
    const tokenResponse = await fetch('http://localhost:5001/use-token');
    const tokenData = await tokenResponse.json();

    if (tokenData.error && retryCount < 3) {
      // Wait and retry if token not available yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getTokenAndFetchLocation(retryCount + 1);
    }

    if (tokenData.token) {
      console.log('Token retrieved:', tokenData.token);
      const url = "https://www.onemap.gov.sg/api/public/popapi/getPlanningareaNames?year=2019";

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': tokenData.token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData && Array.isArray(responseData)) {
        updateLocationFilter(responseData);
      } else {
        console.error('Unexpected response format:', responseData);
      }
    }
  } catch (error) {
    console.error('Error fetching planning areas:', error);
    if (retryCount < 3) {
      // Retry on failure
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getTokenAndFetchLocation(retryCount + 1);
    }
  }
}

getTokenAndFetchLocation();

export { locationFilter };

// Export the filter options
export const internshipFilterOptions = {
  location: locationFilter,
  course: {
    label: "Course",
    defaultOption: "All Courses",
    type: "fieldCourse" // Special type for our custom field-course selector
  },
  year: {
    label: "Year of Study",
    defaultOption: "All Years",
    choices: [
      { value: "Year 1", label: "Year 1" },
      { value: "Year 2", label: "Year 2" },
      { value: "Year 3", label: "Year 3" },
      { value: "Year 4", label: "Year 4" }
    ]
  },
  stipend: {
    label: "Stipend Range",
    type: "range",
    min: 0,
    max: 5000,
    defaultValue: [0, 5000]
  },
  duration: {
    label: "Duration (Months)",
    type: "range",
    min: 1,
    max: 12,
    defaultValue: [1, 12]
  }
};

export const adhocFilterOptions = {
  location: locationFilter,
  payPerHour: {
    label: "Pay Per Hour Range",
    type: "range",
    min: 0,
    max: 100,
    defaultValue: [0, 100],
    step: 1
  }
};

export const defaultInternshipFilters = {
  location: '',
  course: [],
  year: '',
  stipend: [0, 5000],
  duration: [1, 12]
};

export const defaultAdhocFilters = {
  location: '',
  payPerHour: [0, 100]
};

const FilterConfig = () => {
  React.useEffect(() => {
    // Start fetching locations when component mounts
    getTokenAndFetchLocation();
  }, []);

  return null; // This component doesn't render anything but initializes filters
};

export default React.memo(FilterConfig);
