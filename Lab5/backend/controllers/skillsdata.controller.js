import axios from 'axios';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const fetchSkillsData = async () => {
  try {
    // Fetch the access token from the backend using only environment variables
    const tokenResponse = await axios.get(`${process.env.TOKEN_SERVER_URL}/use-token`);
    const accessToken = tokenResponse.data.token2;

    // Use the access token to fetch skills data
    const options = {
      method: 'GET',
      url: 'https://emsiservices.com/skills/versions/latest/skills',
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    const response = await axios(options);
    const skillNames = response.data.data.map(skill => skill.name.trim());
    return skillNames;
    } catch (error) {
    console.error('Error fetching skills data:', error.response ? error.response.data : error.message);
    }
  };

export { fetchSkillsData };
