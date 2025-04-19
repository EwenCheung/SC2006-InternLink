/**
 * UniversitiesService.js
 * Service for fetching universities data from the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchUniversities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/universities`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.universities;
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
};

export { fetchUniversities };