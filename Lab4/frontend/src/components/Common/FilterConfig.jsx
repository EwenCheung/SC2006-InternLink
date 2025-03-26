import React from 'react';

export const jobFilterOptions = {
  location: {
    label: "Location",
    defaultOption: "All Locations",
    choices: [
      { value: "north", label: "North" },
      { value: "south", label: "South" },
      { value: "east", label: "East" },
      { value: "west", label: "West" },
      { value: "central", label: "Central" }
    ]
  },
  course: {
    label: "Course",
    defaultOption: "All Courses",
    choices: [
      { value: "cs", label: "Computer Science" },
      { value: "ee", label: "Electrical Engineering" },
      { value: "me", label: "Mechanical Engineering" },
      { value: "business", label: "Business" }
    ]
  },
  year: {
    label: "Year of Study",
    defaultOption: "All Years",
    choices: [
      { value: "1", label: "Year 1" },
      { value: "2", label: "Year 2" },
      { value: "3", label: "Year 3" },
      { value: "4", label: "Year 4" }
    ]
  },
  stipend: {
    label: "Stipend",
    defaultOption: "All Stipends",
    choices: [
      { value: "low", label: "Below $500" },
      { value: "medium", label: "$500 - $1000" },
      { value: "high", label: "Above $1000" }
    ]
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

export const defaultFilters = {
  location: '',
  course: '',
  year: '',
  stipend: '',
  duration: ''
};

const FilterConfig = () => {
  return null; // This component doesn't render anything
};

export default FilterConfig;
