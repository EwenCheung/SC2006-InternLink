import React from 'react';

// Shared location filter
export const locationFilter = {
  label: "Location",
  defaultOption: "All Locations",
  choices: [
    { value: "ang mo kio", label: "Ang Mo Kio" },
    { value: "bedok", label: "Bedok" },
    { value: "bishan", label: "Bishan" },
    { value: "bukit batok", label: "Bukit Batok" },
    { value: "bukit merah", label: "Bukit Merah" },
    { value: "bukit panjang", label: "Bukit Panjang" },
    { value: "bukit timah", label: "Bukit Timah" },
    { value: "central", label: "Central Area" },
    { value: "clementi", label: "Clementi" },
    { value: "geylang", label: "Geylang" },
    { value: "hougang", label: "Hougang" },
    { value: "jurong east", label: "Jurong East" },
    { value: "jurong west", label: "Jurong West" },
    { value: "kallang", label: "Kallang" },
    { value: "marine parade", label: "Marine Parade" },
    { value: "novena", label: "Novena" },
    { value: "pasir ris", label: "Pasir Ris" },
    { value: "punggol", label: "Punggol" },
    { value: "queenstown", label: "Queenstown" },
    { value: "sembawang", label: "Sembawang" },
    { value: "sengkang", label: "Sengkang" },
    { value: "serangoon", label: "Serangoon" },
    { value: "tampines", label: "Tampines" },
    { value: "toa payoh", label: "Toa Payoh" },
    { value: "woodlands", label: "Woodlands" },
    { value: "yishun", label: "Yishun" }
  ]
};

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
