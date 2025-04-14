import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from './JS_JobDetailsPage.module.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, FaBuilding, FaArrowLeft, FaShareAlt, FaComment, FaTimes, FaBriefcase, FaLocationArrow } from 'react-icons/fa';
import LeafletMap from '../../components/Maps/LeafletMap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_AdHocDetailsPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobseekerId, setJobseekerId] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeatureMessage, setShowFeatureMessage] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');
  const [formattedDeadline, setFormattedDeadline] = useState('');

  // Add states for route planning
  const [fromLocation, setFromLocation] = useState('');
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [travelMode, setTravelMode] = useState('TRANSIT');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Add states for address suggestions
  const [fromLocationSuggestions, setFromLocationSuggestions] = useState([]);
  const [isLoadingFromSuggestions, setIsLoadingFromSuggestions] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setJobseekerId(userData._id);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Function to increment view count
  const incrementViewCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(`${API_BASE_URL}/api/jobs/adhoc/${jobId}/increment-view`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error incrementing view count:', err);
      // Don't set error state as this is a non-critical operation
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_BASE_URL}/api/jobs/adhoc/${jobId}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        
        const { data } = await response.json();
        setJobDetails(data);

        // Set map coordinates
        if (data.location) {
          fetchCoordinates(data.location);
        } else {
          setLatitude(1.3521);
          setLongitude(103.8198);
        }

        if (data.applicationDeadline) {
          const deadlineDate = new Date(data.applicationDeadline);
          setFormattedDeadline(deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }
        
        // Increment view count after successfully fetching job details
        incrementViewCount();
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    // Fetch coordinates for map
    const fetchCoordinates = async (address) => {
      try {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
        const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
        const tokenData = await tokenResponse.json();
        const authToken = tokenData.token;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `${authToken}`,
          }
        });
        const data = await response.json();
        if (data.results?.length > 0) {
          const { LATITUDE: fetchedLatitude, LONGITUDE: fetchedLongitude } = data.results[0];
          setLatitude(fetchedLatitude);
          setLongitude(fetchedLongitude);
        }
      } catch (err) {
        console.error('Error fetching coordinates:', err);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!jobseekerId || !jobId) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/jobs/check-application-status/${jobseekerId}/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.hasApplied) {
            setIsApplied(true);
          }
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    checkApplicationStatus();
  }, [jobseekerId, jobId]);

  const handleWithdrawApplication = async () => {
    setShowConfirmation(true);
  };

  const confirmWithdrawal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/jobseeker/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs/delete-application/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      setIsApplied(false);
      setShowConfirmation(false);

      // Show success message
      setFeatureMessage('Application withdrawn successfully!');
      setShowFeatureMessage(true);
      
      setTimeout(() => {
        setShowFeatureMessage(false);
      }, 1500);
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setShowConfirmation(false);
    }
  };

  const cancelWithdrawal = () => {
    setShowConfirmation(false);
  };

  const handleMessageEmployer = () => {
    setFeatureMessage('The messaging feature is currently under development and will be available soon!');
    setShowFeatureMessage(true);
    
    setTimeout(() => {
      setShowFeatureMessage(false);
    }, 1500);
  };

  const handleShareJob = () => {
    setFeatureMessage('The job sharing feature is currently under development and will be available soon!');
    setShowFeatureMessage(true);
    
    setTimeout(() => {
      setShowFeatureMessage(false);
    }, 1500);
  };

  // Function to handle from location input change
  const handleFromLocationChange = (e) => {
    const value = e.target.value;
    setFromLocation(value);
    fetchFromLocationSuggestions(value);
  };

  // Add function to fetch address suggestions for starting point
  const fetchFromLocationSuggestions = async (searchVal) => {
    if (!searchVal.trim()) {
      setFromLocationSuggestions([]);
      return;
    }
    
    setIsLoadingFromSuggestions(true);
    try {
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
      const tokenData = await tokenResponse.json();
      const authToken = tokenData.token;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${authToken}`,
        }
      });
      
      const data = await response.json();
      
      if (data && data.results) {
        const searchLower = searchVal.toLowerCase();
        
        // First, get exact building name matches
        const buildingMatches = data.results.filter(item => 
          item.BUILDING !== "NIL" && 
          item.BUILDING.toLowerCase().includes(searchLower)
        );
        
        // Next, get exact road name matches
        const roadMatches = data.results.filter(item => 
          (item.BUILDING === "NIL" || !item.BUILDING.toLowerCase().includes(searchLower)) &&
          item.ROAD_NAME.toLowerCase().includes(searchLower)
        );
        
        // Finally, get address matches that aren't already in our lists
        const addressMatches = data.results.filter(item => 
          !buildingMatches.includes(item) && 
          !roadMatches.includes(item) && 
          item.ADDRESS.toLowerCase().includes(searchLower)
        );
        
        // Combine all matches in priority order
        let combinedResults = [...buildingMatches, ...roadMatches, ...addressMatches];
        
        // If we have fewer than 5 results, add additional results
        if (combinedResults.length < 5 && data.results.length > combinedResults.length) {
          const additionalResults = data.results.filter(item => !combinedResults.includes(item));
          combinedResults = [...combinedResults, ...additionalResults.slice(0, 5 - combinedResults.length)];
        }
        
        // Return up to 10 results
        const minResults = Math.min(Math.max(5, combinedResults.length), 10);
        setFromLocationSuggestions(combinedResults.slice(0, minResults));
      } else {
        setFromLocationSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
      setFromLocationSuggestions([]);
    } finally {
      setIsLoadingFromSuggestions(false);
    }
  };

  // Function to select a suggestion
  const handleFromSuggestionSelect = (address) => {
    setFromLocation(address);
    setFromLocationSuggestions([]);
  };

  // Add function to calculate route
  const calculateRoute = async () => {
    if (!fromLocation || !latitude || !longitude) {
      setRouteError('Please enter a starting location');
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError('');
    setRouteOptions([]);
    setSelectedRoute(null);

    try {
      // Check if the location is already in lat,long format
      const latLongPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const latLongMatch = fromLocation.trim().match(latLongPattern);
      
      let fromLatitude, fromLongitude;
      
      // Get token for API calls
      const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
      const tokenData = await tokenResponse.json();
      const authToken = tokenData.token;
      
      if (latLongMatch) {
        // If location is already in lat,long format, use it directly
        fromLatitude = latLongMatch[1];
        fromLongitude = latLongMatch[3];
        console.log('Using direct coordinates:', fromLatitude, fromLongitude);
      } else {
        // Otherwise, fetch coordinates from the location string
        const fromCoordinatesUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(fromLocation)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

        const fromLocationResponse = await fetch(fromCoordinatesUrl, {
          method: 'GET',
          headers: {
            'Authorization': `${authToken}`,
          }
        });
        
        const fromLocationData = await fromLocationResponse.json();
        if (!fromLocationData.results || fromLocationData.results.length === 0) {
          throw new Error('Starting location not found. Please try a different address.');
        }
        
        fromLatitude = fromLocationData.results[0].LATITUDE;
        fromLongitude = fromLocationData.results[0].LONGITUDE;
      }
      
      // Format date and time for the API
      const today = new Date();
      const date = today.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
      
      // Format time as HH:MM:SS
      const time = today.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/:/g, '%3A');
      
      // Configure URL parameters based on travel mode
      let routeUrl;
      
      if (travelMode === 'TRANSIT') {
        // For transit, use the selected route type with date and time
        routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${fromLatitude}%2C${fromLongitude}&end=${latitude}%2C${longitude}&routeType=pt&date=${date}&time=${time}&mode=TRANSIT&maxWalkDistance=1000&numItineraries=3`;
      } else if (travelMode === 'WALK') {
        // For walking, use walk route type (lowercase)
        routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${fromLatitude}%2C${fromLongitude}&end=${latitude}%2C${longitude}&routeType=walk`;
      } else if (travelMode === 'DRIVE') {
        // For driving, use drive route type (lowercase)
        routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${fromLatitude}%2C${fromLongitude}&end=${latitude}%2C${longitude}&routeType=drive`;
      } else if (travelMode === 'CYCLE') {
        // For cycling, use cycle route type (lowercase)
        routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${fromLatitude}%2C${fromLongitude}&end=${latitude}%2C${longitude}&routeType=cycle`;
      }
      
      console.log('Route URL:', routeUrl); // Debug log
      
      const routeResponse = await fetch(routeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `${authToken}`,
        }
      });
      
      const routeData = await routeResponse.json();
      console.log('Route data:', routeData); // Debug log
      
      // Handle different response formats based on travel mode
      if (travelMode === 'TRANSIT') {
        // Handle public transit response format
        if (routeData.plan && routeData.plan.itineraries && routeData.plan.itineraries.length > 0) {
          // For transit, we can use the response directly
          setRouteOptions(routeData.plan.itineraries);
          setSelectedRoute(routeData.plan.itineraries[0]); // Select the first route by default
        } else {
          throw new Error('No public transport routes found between these locations. The locations might be too far apart or not well-connected by public transport. Try using a different travel mode or locations.');
        }
      } else {
        // Handle walking/driving/cycling response format
        if (routeData.status === 0 && routeData.status_message === "Found route between points") {
          // Convert the non-transit response to a format similar to transit for consistent display
          const totalTime = routeData.route_summary.total_time;
          const totalDistance = routeData.route_summary.total_distance;
          const now = Date.now();
          
          // Create a synthetic itinerary that matches the format we use for display
          // but also includes the raw route data for the map component
          const syntheticItinerary = {
            duration: totalTime,
            walkTime: travelMode === 'WALK' ? totalTime : 0,
            transitTime: travelMode !== 'WALK' ? totalTime : 0,
            startTime: now,
            endTime: now + (totalTime * 1000), // Convert seconds to milliseconds
            legs: [{
              mode: travelMode.toUpperCase(),
              route: '',
              from: { name: fromLocation },
              to: { name: jobDetails?.location || 'Destination' },
              startTime: now,
              endTime: now + (totalTime * 1000),
              distance: totalDistance,
              intermediateStops: []
            }],
            walkDistance: travelMode === 'WALK' ? totalDistance : 0,
            fare: 0,
            // Add the raw route data for map rendering
            rawRouteData: routeData
          };
          
          setRouteOptions([syntheticItinerary]);
          setSelectedRoute(syntheticItinerary);
        } else {
          const modeText = travelMode === 'WALK' ? 'walking' : travelMode === 'DRIVE' ? 'driving' : 'cycling';
          throw new Error(`No ${modeText} routes found between these locations. The locations might be too far apart or not connected by roads. Try using a different travel mode or locations.`);
        }
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      
      // Set a user-friendly error message
      if (err.message.includes('Starting location not found')) {
        setRouteError(err.message);
      } else if (err.message.includes('No public transport routes found') || 
                 err.message.includes('No walking routes found') ||
                 err.message.includes('No driving routes found') ||
                 err.message.includes('No cycling routes found') ||
                 err.message.includes('No routes found')) {
        setRouteError(err.message);
      } else {
        // Generic error message for other issues
        setRouteError('Route calculation failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRouteError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingCurrentLocation(true);
    setRouteError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address from coordinates
          const url = `https://www.onemap.gov.sg/api/common/revgeocode?location=${latitude},${longitude}&buffer=10&addressType=All`;
          const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
          const tokenData = await tokenResponse.json();
          const authToken = tokenData.token;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `${authToken}`,
            }
          });
          
          const data = await response.json();
          
          if (data && data.GeocodeInfo && data.GeocodeInfo.length > 0) {
            const address = data.GeocodeInfo[0].ROAD || data.GeocodeInfo[0].BUILDINGNAME || 'Your Location';
            setFromLocation(address);
          } else {
            setFromLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          console.error('Error getting address from coordinates:', err);
          setFromLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setIsGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        setRouteError('Unable to retrieve your location. Please ensure location services are enabled.');
        setIsGettingCurrentLocation(false);
      }
    );
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    // If seconds is already in minutes format (less than 500), treat as minutes directly
    const totalMinutes = seconds < 500 ? seconds : Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
    } else {
      return `${totalMinutes}m`;
    }
  };

  // Helper function to format distance
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  };

  const renderRouteOptions = () => {
    return (
      <div className={styles.routeOptions}>
        {routeOptions.map((route, index) => (
          <div 
            key={index} 
            className={`${styles.routeOption} ${selectedRoute === route ? styles.selectedRoute : ''}`}
            onClick={() => setSelectedRoute(route)}
          >
            <div className={styles.routeOptionHeader}>
              <span className={styles.routeNumber}>
                {routeOptions.length > 1 && travelMode === 'TRANSIT' ? `Route ${index + 1}` : 
                 travelMode === 'TRANSIT' ? 'Transit' : 
                 travelMode === 'WALK' ? 'Walking' :
                 travelMode === 'DRIVE' ? 'Driving' : 'Cycling'}
              </span>
              <span className={styles.routeDuration}>{formatDuration(route.duration)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Update the renderRouteCalculator function to remove the route type selection
  const renderRouteCalculator = () => {
    return (
      <div className={styles.minimapCard}>
        <h3>Calculate Your Route</h3>
        <div className={styles.routeCalculator}>
          <div className={styles.routeForm}>
            <div className={styles.routeInput}>
              <label htmlFor="fromLocation">Starting Point:</label>
              <div className={styles.locationInputWrapper}>
                <input
                  type="text"
                  id="fromLocation"
                  value={fromLocation}
                  onChange={handleFromLocationChange}
                  placeholder="Enter your starting location"
                  autoComplete="off"
                />
                <button 
                  type="button" 
                  className={styles.currentLocationButton}
                  onClick={getCurrentLocation}
                  disabled={isGettingCurrentLocation}
                  title="Use current location"
                >
                  {isGettingCurrentLocation ? '...' : <FaLocationArrow />}
                </button>
              </div>
              {isLoadingFromSuggestions && <div className={styles.loadingText}>Searching locations...</div>}
              
              {!isLoadingFromSuggestions && fromLocationSuggestions.length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {fromLocationSuggestions.map((suggestion, index) => {
                    // Get the most relevant info to display
                    const primaryInfo = suggestion.BUILDING !== "NIL" 
                      ? suggestion.BUILDING 
                      : suggestion.ROAD_NAME;
                    
                    return (
                      <div 
                        key={index} 
                        className={styles.suggestionItem}
                        onClick={() => handleFromSuggestionSelect(suggestion.ADDRESS)}
                      >
                        <div className={styles.suggestionPrimary}>
                          {primaryInfo}
                        </div>
                        <div className={styles.suggestionSecondary}>
                          {suggestion.ADDRESS}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className={styles.routeInput}>
              <label htmlFor="destination">Destination:</label>
              <input
                type="text"
                value={jobDetails?.location || ''}
                disabled
                placeholder="Job location"
              />
            </div>
            
            <div className={styles.travelModeButtons}>
              <label>Travel By:</label>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.modeButton} ${travelMode === 'TRANSIT' ? styles.activeMode : ''}`}
                  onClick={() => {
                    // Clear route options and selected route immediately
                    setRouteOptions([]);
                    setSelectedRoute(null);
                    setRouteError('');
                    
                    // Only update the travel mode, don't auto-calculate
                    setTravelMode('TRANSIT');
                  }}
                >
                  <span>Public Transport</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeButton} ${travelMode === 'WALK' ? styles.activeMode : ''}`}
                  onClick={() => {
                    setRouteOptions([]);
                    setSelectedRoute(null);
                    setRouteError('');
                    setTravelMode('WALK');
                  }}
                >
                  <span>Walking</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeButton} ${travelMode === 'DRIVE' ? styles.activeMode : ''}`}
                  onClick={() => {
                    setRouteOptions([]);
                    setSelectedRoute(null);
                    setRouteError('');
                    setTravelMode('DRIVE');
                  }}
                >
                  <span>Driving</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeButton} ${travelMode === 'CYCLE' ? styles.activeMode : ''}`}
                  onClick={() => {
                    setRouteOptions([]);
                    setSelectedRoute(null);
                    setRouteError('');
                    setTravelMode('CYCLE');
                  }}
                >
                  <span>Cycling</span>
                </button>
              </div>
            </div>
            
            <button 
              className={styles.calculateButton} 
              onClick={calculateRoute}
              disabled={isCalculatingRoute}
            >
              {isCalculatingRoute ? 'Calculating...' : 'Calculate Route'}
            </button>
            
            {routeError && <p className={styles.routeError}>{routeError}</p>}
          </div>
          
          {routeOptions.length > 0 && (
            <div className={styles.routeResults}>
              {renderRouteOptions()}
              
              {selectedRoute && renderRouteDetails(selectedRoute)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update the renderRouteDetails function to remove the route instructions
  const renderRouteDetails = (selectedRoute) => {
    // For transit mode
    if (travelMode === 'TRANSIT') {
      return (
        <div className={styles.routeDetails}>
          <div className={styles.routeSummary}>
            <div className={styles.routeMetric}>
              <span className={styles.metricLabel}>Total Time:</span>
              <span className={styles.metricValue}>{formatDuration(selectedRoute.duration)}</span>
            </div>
            
            <div className={styles.routeMetric}>
              <span className={styles.metricLabel}>Walking Time:</span>
              <span className={styles.metricValue}>{formatDuration(selectedRoute.walkTime)}</span>
            </div>
            <div className={styles.routeMetric}>
              <span className={styles.metricLabel}>Transit Time:</span>
              <span className={styles.metricValue}>{formatDuration(selectedRoute.transitTime)}</span>
            </div>
            {selectedRoute.fare && (
              <div className={styles.routeMetric}>
                <span className={styles.metricLabel}>Fare:</span>
                <span className={styles.metricValue}>${selectedRoute.fare}</span>
              </div>
            )}
          </div>

          {/* Add Leaflet map for transit route */}
          <div className={styles.routeMapContainer}>
            <LeafletMap routeData={selectedRoute} travelMode={travelMode} />
          </div>
        </div>
      );
    } else {
      // For other modes (walking, driving, cycling)
      return (
        <div className={styles.routeDetails}>
          <div className={styles.routeSummary}>
            <div className={styles.routeMetric}>
              <span className={styles.metricLabel}>Total Time:</span>
              <span className={styles.metricValue}>{formatDuration(selectedRoute.duration)}</span>
            </div>
            
            <div className={styles.routeMetric}>
              <span className={styles.metricLabel}>Distance:</span>
              <span className={styles.metricValue}>{formatDistance(selectedRoute.legs[0].distance)}</span>
            </div>
          </div>

          {/* Add Leaflet map for other route types */}
          <div className={styles.routeMapContainer}>
            <LeafletMap routeData={selectedRoute} travelMode={travelMode} />
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/jobseeker/find-adhoc')}
          className={styles.backButton}
        >
          Return to Ad-Hoc Job Listings
        </button>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className={styles.errorContainer}>
        <h2>No job details available</h2>
        <button
          onClick={() => navigate('/jobseeker/find-adhoc')}
          className={styles.backButton}
        >
          Return to Ad-Hoc Job Listings
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/jobseeker/find-adhoc')}>
        <FaArrowLeft /> Back to Listings
      </button>
      <div className={styles.jobHeader}>
        <div className={styles.basicInfo}>
          <h1 className={styles.jobTitle}><span className={styles.labelText}>Job Title: </span>{jobDetails.title}</h1>
          <h2 className={styles.companyName}><span className={styles.labelText}>Company Name: </span>{jobDetails.company}</h2>
          <div className={styles.badgeContainer}>
            <span className={styles.badge}>Ad-Hoc</span>
            {jobDetails.tags && jobDetails.tags.length > 0 && (
              <span className={styles.badge}>{jobDetails.tags[0]}</span>
            )}
          </div>
        </div>
        <div className={styles.deadlineInfo}>
          <div className={styles.deadlineTimer}>
            <span className={styles.deadlineLabel}>Application Deadline</span>
            <span className={styles.deadlineDate}>{formattedDeadline || 'Not specified'}</span>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.quickInfoPanel}>
            <div className={styles.infoCard}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>{jobDetails.location}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <FaDollarSign className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Pay Per Hour</span>
                <span className={styles.infoValue}>${jobDetails.payPerHour}/hour</span>
              </div>
            </div>
            
            {jobDetails.duration && (
              <div className={styles.infoCard}>
                <FaClock className={styles.infoIcon} />
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Duration</span>
                  <span className={styles.infoValue}>{jobDetails.duration}</span>
                </div>
              </div>
            )}
            
            {jobDetails.area && (
              <div className={styles.infoCard}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Area</span>
                  <span className={styles.infoValue}>{jobDetails.area}</span>
                </div>
              </div>
            )}
          </div>

          <section className={styles.companySection}>
            <h3><FaBuilding className={styles.sectionIcon} /> About the Company</h3>
            <p className={styles.companyDescription}>{jobDetails.companyDescription || jobDetails.description}</p>
            <div className={styles.companyDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{jobDetails.location}</span>
              </div>
              {jobDetails.area && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>Area:</span>
                  <span className={styles.value}>{jobDetails.area}</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.jobDetailsSection}>
            <h3><FaBriefcase className={styles.sectionIcon} /> Job Description</h3>
            <p className={styles.description}>{jobDetails.description}</p>
            
            {jobDetails.jobScope && (
              <>
                <h3><FaBriefcase className={styles.sectionIcon} /> Job Scope</h3>
                <p className={styles.description}>{jobDetails.jobScope}</p>
              </>
            )}
            
            {jobDetails.tags && jobDetails.tags.length > 0 && (
              <>
                <h3><FaBriefcase className={styles.sectionIcon} /> Skills Required</h3>
                <ul className={styles.skillsList}>
                  {jobDetails.tags.map((skill, index) => (
                    <li key={index} className={styles.skillTag}>{skill}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className={styles.applicationSidebar}>
          <div className={styles.applicationCard}>
            <h3>Application</h3>
            <div className={styles.applicationInfo}>
              <p className={styles.deadline}>
                <FaCalendarAlt className={styles.deadlineIcon} /> 
                Application closes on {formattedDeadline || 'Not specified'}
              </p>
              {jobDetails.applicants !== undefined && (
                <p className={styles.applicants}>
                  {jobDetails.applicants} {jobDetails.applicants === 1 ? 'person has' : 'people have'} applied
                </p>
              )}
            </div>
            
            <div className={styles.actionButtons}>
              {isApplied ? (
                <button className={styles.withdrawButton} onClick={handleWithdrawApplication}>
                  Withdraw Application
                </button>
              ) : (
                <button className={styles.applyButton} onClick={() => navigate(`/jobseeker/adhoc-application/${jobId}`)}>
                  Apply for Position
                </button>
              )}
              <button className={styles.messageButton} onClick={handleMessageEmployer}>
                <FaComment /> Message Employer
              </button>
              <button className={styles.shareButton} onClick={handleShareJob}>
                <FaShareAlt /> Share Job
              </button>
            </div>
          </div>
          
          {renderRouteCalculator()}
        </aside>
      </div>

      {showConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <h3>Withdraw Application</h3>
            <p>Are you sure you want to withdraw this application? This action cannot be undone.</p>
            <div className={styles.confirmationButtons}>
              <button 
                className={styles.cancelButton}
                onClick={cancelWithdrawal}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={confirmWithdrawal}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeatureMessage && (
        <div>
          <div className={styles.featureMessageOverlay}></div>
          <div className={styles.featureMessage}>
            {featureMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default JS_AdHocDetailsPage;
