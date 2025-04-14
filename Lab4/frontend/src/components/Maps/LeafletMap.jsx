import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LeafletMap.module.css';

// Fix for default markers not showing in production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LeafletMap = ({ routeData, travelMode }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Function to decode polyline for transit routes
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    try {
      while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        
        do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat * 1e-5, lng * 1e-5]);
      }
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }

    return points;
  };

  // Initialize map when the component mounts
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Default center on Singapore if no route data available
    const defaultCenter = [1.3521, 103.8198];
    
    // Create map instance with improved styling
    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: false, // Remove default zoom control for custom positioning
    });
    
    // Add colorful map tiles instead of the light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    
    // Add zoom control to bottom right instead of default top left
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    
    mapInstanceRef.current = map;
    
    // Cleanup map on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Draw the route on the map when route data is available
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeData) return;
    
    // Clear previous layers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
    
    // Add the base tile layer back if it was removed
    if (!map.hasLayer(L.TileLayer)) {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
    }
    
    // Initialize bounds 
    const bounds = new L.LatLngBounds();
    let hasBounds = false;
    
    // Create custom markers with more vibrant colors
    const createCustomMarker = (type) => {
      const iconUrl = type === 'start' ? 
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' : 
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
      
      return L.icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };
    
    const startIcon = createCustomMarker('start');
    const endIcon = createCustomMarker('end');
    
    if (travelMode === 'TRANSIT') {
      // For public transport, we need to process each leg of the journey
      if (routeData.legs && routeData.legs.length > 0) {
        // Process each leg of the journey
        routeData.legs.forEach((leg, legIndex) => {
          if (!leg.legGeometry || !leg.legGeometry.points) return;
          
          // Decode the polyline for this leg
          const points = decodePolyline(leg.legGeometry.points);
          if (points.length === 0) return;
          
          // Extend bounds with all points
          points.forEach(point => {
            bounds.extend(point);
            hasBounds = true;
          });
          
          // Determine color based on the leg mode with improved visibility
          let color;
          let weight = 6; // Thicker lines for better visibility
          
          switch (leg.mode) {
            case 'WALK':
              color = '#9C27B0'; // Purple for walking
              weight = 4; // Slightly thinner for walking
              break;
            case 'BUS':
              color = '#00796B'; // Teal for bus
              break;
            case 'SUBWAY':
            case 'RAIL':
              color = '#FFC400'; // Yellow for subway/rail
              break;
            default:
              color = '#4285F4'; // Blue for other transit modes
              break;
          }
          
          // Draw the polyline for this leg with solid colors
          L.polyline(points, {
            color: color,
            weight: weight,
            opacity: 1, // Fully opaque for solid appearance
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          // Add markers for the start and end of this leg
          if (legIndex === 0 && leg.from && leg.from.lat && leg.from.lon) {
            const startLatLng = [parseFloat(leg.from.lat), parseFloat(leg.from.lon)];
            L.marker(startLatLng, { icon: startIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Start:</strong> ${leg.from.name || 'Starting Point'}</div>`);
            bounds.extend(startLatLng);
            hasBounds = true;
          }
          
          if (leg.to && leg.to.lat && leg.to.lon) {
            const endLatLng = [parseFloat(leg.to.lat), parseFloat(leg.to.lon)];
            
            // Only add end marker for the last leg
            if (legIndex === routeData.legs.length - 1) {
              L.marker(endLatLng, { icon: endIcon })
                .addTo(map)
                .bindPopup(`<div class="${styles.customPopup}"><strong>End:</strong> ${leg.to.name || 'Destination'}</div>`);
            }
            
            bounds.extend(endLatLng);
            hasBounds = true;
          }
          
          // Add markers for intermediate stops with improved styling
          if (leg.mode !== 'WALK' && leg.intermediateStops && leg.intermediateStops.length > 0) {
            leg.intermediateStops.forEach(stop => {
              if (stop.lat && stop.lon) {
                const stopLatLng = [parseFloat(stop.lat), parseFloat(stop.lon)];
                
                // Use a custom stop icon for better visibility
                const stopIcon = L.divIcon({
                  className: styles.stopIcon,
                  html: `<div class="${styles.stopDot}" style="background-color: ${color};"></div>`,
                  iconSize: [14, 14]
                });
                
                L.marker(stopLatLng, { icon: stopIcon })
                  .addTo(map)
                  .bindPopup(`<div class="${styles.customPopup}"><strong>Stop:</strong> ${stop.name || 'Transit Stop'}</div>`);
                
                bounds.extend(stopLatLng);
                hasBounds = true;
              }
            });
          }
        });
      }
    } else {
      // For other travel modes (WALK, DRIVE, CYCLE)
      
      // Get route color with improved visibility and vibrancy
      const routeColor = getColorForMode(travelMode);
      const routeWeight = 6; // Thicker lines for better visibility
      
      // Check if we have raw route data embedded in the synthetic itinerary
      if (routeData.rawRouteData && routeData.rawRouteData.status === 0) {
        // Process the raw route data directly
        const rawRouteData = routeData.rawRouteData;
        
        if (rawRouteData.route_geometry) {
          // Decode the route geometry polyline
          const routePoints = decodePolyline(rawRouteData.route_geometry);
          
          if (routePoints && routePoints.length > 0) {
            // Extend bounds with all points
            routePoints.forEach(point => {
              bounds.extend(point);
              hasBounds = true;
            });
            
            // Draw the polyline with solid colors
            L.polyline(routePoints, {
              color: routeColor,
              weight: routeWeight,
              opacity: 1, // Fully opaque for solid appearance
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            // Add custom markers for start and end
            if (routePoints.length >= 2) {
              L.marker(routePoints[0], { icon: startIcon })
                .addTo(map)
                .bindPopup(`<div class="${styles.customPopup}"><strong>Starting Point</strong></div>`);
              
              L.marker(routePoints[routePoints.length - 1], { icon: endIcon })
                .addTo(map)
                .bindPopup(`<div class="${styles.customPopup}"><strong>Destination</strong></div>`);
            }
          }
        } 
        else if (rawRouteData.route_instructions && rawRouteData.route_instructions.length > 0) {
          // Extract coordinate points from route instructions
          const points = [];
          
          rawRouteData.route_instructions.forEach(instruction => {
            if (instruction.length >= 4 && typeof instruction[3] === 'string') {
              // Format is typically "lat,lng"
              const coordParts = instruction[3].split(',');
              if (coordParts.length === 2) {
                const lat = parseFloat(coordParts[0]);
                const lng = parseFloat(coordParts[1]);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                  points.push([lat, lng]);
                }
              }
            }
          });
          
          if (points.length > 0) {
            // Extend bounds with all points
            points.forEach(point => {
              bounds.extend(point);
              hasBounds = true;
            });
            
            // Draw the polyline with solid colors
            L.polyline(points, {
              color: routeColor,
              weight: routeWeight,
              opacity: 1, // Fully opaque for solid appearance
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            // Add markers for start and end
            if (points.length >= 2) {
              L.marker(points[0], { icon: startIcon })
                .addTo(map)
                .bindPopup(`<div class="${styles.customPopup}"><strong>Starting Point</strong></div>`);
              
              L.marker(points[points.length - 1], { icon: endIcon })
                .addTo(map)
                .bindPopup(`<div class="${styles.customPopup}"><strong>Destination</strong></div>`);
            }
          }
        }
      } 
      else if (routeData.status === 0 && routeData.route_geometry) {
        // Handle direct route data response
        const routePoints = decodePolyline(routeData.route_geometry);
        
        if (routePoints && routePoints.length > 0) {
          // Extend bounds with all points
          routePoints.forEach(point => {
            bounds.extend(point);
            hasBounds = true;
          });
          
          // Draw the polyline with solid colors
          L.polyline(routePoints, {
            color: routeColor,
            weight: routeWeight,
            opacity: 1, // Fully opaque for solid appearance
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          
          // Add markers for start and end
          if (routePoints.length >= 2) {
            L.marker(routePoints[0], { icon: startIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Starting Point</strong></div>`);
            
            L.marker(routePoints[routePoints.length - 1], { icon: endIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Destination</strong></div>`);
          }
        }
      }
      else if (routeData.legs && routeData.legs.length > 0) {
        const leg = routeData.legs[0]; // We only have one leg for non-transit routes
        
        // Look for the raw API response which might be embedded
        if (leg.rawRouteData && leg.rawRouteData.route_geometry) {
          const routePoints = decodePolyline(leg.rawRouteData.route_geometry);
          
          if (routePoints && routePoints.length > 0) {
            // Draw using the decoded polyline points
            routePoints.forEach(point => {
              bounds.extend(point);
              hasBounds = true;
            });
            
            L.polyline(routePoints, {
              color: routeColor,
              weight: routeWeight,
              opacity: 1, // Fully opaque for solid appearance
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            // Add markers at the first and last points of the route
            L.marker(routePoints[0], { icon: startIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Starting Point</strong></div>`);
            
            L.marker(routePoints[routePoints.length - 1], { icon: endIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Destination</strong></div>`);
          }
        }
        else {
          let fromPoint, toPoint;
          
          if (leg.from && leg.to) {
            if (leg.from.lat && leg.from.lon && leg.to.lat && leg.to.lon) {
              fromPoint = [parseFloat(leg.from.lat), parseFloat(leg.from.lon)];
              toPoint = [parseFloat(leg.to.lat), parseFloat(leg.to.lon)];
            } else if (leg.from.lat !== undefined && leg.from.lng !== undefined && 
                     leg.to.lat !== undefined && leg.to.lng !== undefined) {
              fromPoint = [leg.from.lat, leg.from.lng];
              toPoint = [leg.to.lat, leg.to.lng];
            }
          }
          
          if (fromPoint && toPoint) {
            // Add markers
            L.marker(fromPoint, { icon: startIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Start:</strong> ${leg.from.name || 'Starting Point'}</div>`);
            
            L.marker(toPoint, { icon: endIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>End:</strong> ${leg.to.name || 'Destination'}</div>`);
            
            // Draw a straight line between points
            L.polyline([fromPoint, toPoint], {
              color: routeColor,
              weight: routeWeight,
              opacity: 1, // Fully opaque for solid appearance
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            bounds.extend(fromPoint);
            bounds.extend(toPoint);
            hasBounds = true;
          }
        }
      }
      
      if (!hasBounds && routeData.selectedRoute) {
        const nestedRouteData = routeData.selectedRoute;
        
        if (nestedRouteData && nestedRouteData.route_geometry) {
          const routePoints = decodePolyline(nestedRouteData.route_geometry);
          
          if (routePoints && routePoints.length > 0) {
            routePoints.forEach(point => {
              bounds.extend(point);
              hasBounds = true;
            });
            
            L.polyline(routePoints, {
              color: routeColor,
              weight: routeWeight,
              opacity: 1, // Fully opaque for solid appearance
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            L.marker(routePoints[0], { icon: startIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Starting Point</strong></div>`);
            
            L.marker(routePoints[routePoints.length - 1], { icon: endIcon })
              .addTo(map)
              .bindPopup(`<div class="${styles.customPopup}"><strong>Destination</strong></div>`);
          }
        }
      }
    }
    
    // Fit map to bounds with nice animation but without rectangle border
    if (hasBounds) {
      map.fitBounds(bounds, { 
        padding: [40, 40],
        animate: true,
        duration: 0.5
      });
    } else {
      map.setView([1.3521, 103.8198], 12);
    }
  }, [routeData, travelMode]);

  // Helper function to get color based on travel mode with updated colors
  const getColorForMode = (mode) => {
    switch (mode) {
      case 'WALK':
        return '#9C27B0'; // Purple for walking
      case 'DRIVE':
        return '#3F51B5'; // Indigo for driving
      case 'CYCLE':
        return '#FFC400'; // Yellow-gold for cycling
      default:
        return '#2979FF'; // Blue for default
    }
  };

  return <div ref={mapRef} className={styles.mapContainer}></div>;
};

export default LeafletMap;
