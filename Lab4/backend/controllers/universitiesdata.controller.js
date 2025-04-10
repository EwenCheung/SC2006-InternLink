export async function fetchUniversities() {
    const datasetId = "d_3c55210de27fcccda2ed0c63fdd2b352";
    const offset = 40;
    const limit = 1000;
    
    let url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&offset=${offset}&limit=${limit}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.result && data.result.records) {
        return [...new Set(data.result.records.map(record => record.university))]; // Remove duplicates
    }
    } catch (error) {
      return([]); // Return an empty array on error
      console.error("Error fetching university data:", error);
    }
    return [];
  }
