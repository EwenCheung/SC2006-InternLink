import axios from 'axios';

const fetchSkillsData = async () => {
  try {
    // Fetch the access token from the backend
    const tokenResponse = await axios.get(process.env.NODE_ENV === 'production' 
      ? '/use-token'  // In production/cloud, use relative URL
      : 'http://localhost:5001/use-token');  // In local development, use port 5001
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
