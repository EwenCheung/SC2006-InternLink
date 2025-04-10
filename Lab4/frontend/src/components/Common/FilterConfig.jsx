import React from 'react';

async function getTokenAndFetchLocation() {
  try {
    const tokenResponse = await fetch('http://localhost:5001/use-token'); // API call to the backend
    const tokenData = await tokenResponse.json();

    if (tokenData.token) {
      console.log('Token retrieved:', tokenData.token); // Log the token
      const url = "https://www.onemap.gov.sg/api/public/popapi/getPlanningareaNames?year=2019";

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token}`, // Use the token for authorization
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json(); // Fetch planning areas
      if (responseData && Array.isArray(responseData)) {
        locationFilter.choices = responseData.map(area => ({
          value: area.pln_area_n.toLowerCase(),
          label: area.pln_area_n
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        })); // Assign planning areas to location filter choices with title casing
      } else {
        console.error('Unexpected response format or empty response:', responseData);
      }
    } else {
      console.log('No token received');
    }
  } catch (error) {
    console.error('Error fetching planning areas:', error);
  }
}

getTokenAndFetchLocation();



export const locationFilter = {
  label: "Location",
  defaultOption: "All Locations",
}



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
  return null; // This component doesn't render anything
};

export default FilterConfig;
