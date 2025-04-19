/**
 * SkillsService.js
 * Service for fetching skills data from the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchSkillsData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

export { fetchSkillsData };