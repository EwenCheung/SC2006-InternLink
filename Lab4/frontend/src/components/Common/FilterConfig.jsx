import React from 'react';

<<<<<<< HEAD
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
=======
async function getTokenAndFetchLocation() {
>>>>>>> Alvin-Branch
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

<<<<<<< HEAD
// Export the filter configuration
export { locationFilter };

// Export the filter options
=======
getTokenAndFetchLocation();



export const locationFilter = {
  label: "Location",
  defaultOption: "All Locations",
}



>>>>>>> Alvin-Branch
export const internshipFilterOptions = {
  location: locationFilter,
  course: {
    label: "Course",
    defaultOption: "All Courses",
    choices: [
      { value: "Computer Science", label: "Computer Science" },
      { value: "Electrical Engineering", label: "Electrical Engineering" },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Business", label: "Business" }
    ]
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
    label: "Duration",
    defaultOption: "All Durations",
    choices: [
      { value: "short", label: "Less than 3 months" },
      { value: "medium", label: "3-6 months" },
      { value: "long", label: "More than 6 months" }
    ]
  }
};

export const adhocFilterOptions = {
  location: locationFilter,
  payPerHour: {
    label: "Pay Per Hour Range",
    type: "range",
    min: 0,
    max: 100,
    defaultValue: [0, 100]
  }
};

export const defaultInternshipFilters = {
  location: '',
  course: '',
  year: '',
  stipend: [0, 5000],
  duration: ''
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
