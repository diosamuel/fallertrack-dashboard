import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  useAdvancedMarkerRef,
  InfoWindow
} from '@vis.gl/react-google-maps';

import { Circle, type CircleProps } from '../components/circle';
import { Route } from '../components/routes';
import PersonCard from '../components/PersonCard';
import NearbySOSLocation from '../components/NearbySOSLocation';
import FallDetectionAlert from '../components/FallDetectionAlert';
import { API_ENDPOINTS } from '../config/api';

interface HomeLocation {
  latitude: number;
  longitude: number;
  radius: number;
  nama: string;
  time: string;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface SOSLocation {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const MapPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null);
  const [center, setCenter] = useState<LatLngLiteral | null>(null);
  const [radius, setRadius] = useState(400);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [posisiLansia, setPosisiLansia] = useState<LatLngLiteral>({ lat: -5.363431060686779, lng: 105.3068113236821 });
  const [sosLocations, setSosLocations] = useState<SOSLocation[]>([]);
  const [sosMarkerRefs, setSosMarkerRefs] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isHouseInfoOpen, setIsHouseInfoOpen] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState<string | null>(null);
  
  // Add state to store previous location
  const previousLocation = useRef<LatLngLiteral | null>(null);

  // Helper function to check if location has changed significantly
  const hasLocationChangedSignificantly = (prev: LatLngLiteral | null, current: LatLngLiteral) => {
    if (!prev) return true;
    
    // Calculate distance between points (using simple distance formula)
    // You can adjust the threshold based on your needs
    const threshold = 0.00001; // Approximately 1 meter
    const latDiff = Math.abs(prev.lat - current.lat);
    const lngDiff = Math.abs(prev.lng - current.lng);
    
    return latDiff > threshold || lngDiff > threshold;
  };

  // Fetch home location data
  useEffect(() => {
    const fetchHomeLocation = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.HOME, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const { latitude, longitude, radius: homeRadius } = response.data;
        setHomeLocation(response.data);
        setCenter({ lat: latitude, lng: longitude });
        setRadius(homeRadius);
      } catch (error) {
        console.error('Error fetching home location:', error);
      }
    };

    fetchHomeLocation();
  }, []);

  // Fetch current location data every 3 seconds
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CURRENT_DISTANCE, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const { latitude, longitude } = response.data;
        const newLocation = { lat: latitude, lng: longitude };

        // Only update state and log if location has changed significantly
        if (hasLocationChangedSignificantly(previousLocation.current, newLocation)) {
          console.log('Current location updated:', { latitude, longitude });
          setPosisiLansia(newLocation);
          previousLocation.current = newLocation;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error fetching current location:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
        } else {
          console.error('Error fetching current location:', error);
        }
      }
    };

    // Initial fetch
    fetchCurrentLocation();

    // Set up interval for auto-refresh every 5 minutes
    const intervalId = setInterval(fetchCurrentLocation, 300000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to fetch SOS locations
  const fetchNearbySOS = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SOS_LOCATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          radius: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SOS locations');
      }

      const data = await response.json();
      setSosLocations(data.results || []);
    } catch (err) {
      console.error('Error fetching SOS locations:', err);
    }
  };

  // Fetch SOS locations periodically
  useEffect(() => {
    fetchNearbySOS();
    const interval = setInterval(fetchNearbySOS, 300000); // every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleCenterChanged = useCallback((newCenter: google.maps.LatLng | null) => {
    if (isEditMode && newCenter) {
      setCenter({
        lat: newCenter.lat(),
        lng: newCenter.lng()
      });
    }
  }, [isEditMode]);

  const handleRadiusChanged = useCallback((newRadius: number) => {
    if (isEditMode) {
      setRadius(Math.min(newRadius, 500));
    }
  }, [isEditMode]);

  const handleSave = useCallback(async () => {
    if (center && homeLocation) {
      try {
        // First, delete existing home location
        await fetch(API_ENDPOINTS.HOME, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        // Then, set new home location
        const response = await fetch(API_ENDPOINTS.HOME, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: center.lat,
            longitude: center.lng,
            radius: radius
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update home location');
        }

        // Update local state after successful API calls
        setHomeLocation({
          ...homeLocation,
          latitude: center.lat,
          longitude: center.lng,
          radius: radius
        });
      } catch (error) {
        console.error('Error updating home location:', error);
        // You might want to add error handling UI here
      }
    }
    setIsEditMode(false);
  }, [center, radius, homeLocation]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleSOSStatusChange = useCallback((status: boolean) => {
    console.log("SOS status changed:", status);
    setIsSOSActive(status);
  }, []);

  const [markerRef, marker] = useAdvancedMarkerRef();
  const [houseMarkerRef, houseMarker] = useAdvancedMarkerRef();

  if (!center || !homeLocation) {
    return <div className="w-screen h-screen flex items-center justify-center animate-pulse"><img src='https://diosamuel.github.io/Frame%2055(1).png' className='w-52'/></div>;
  }

  return (
    <APIProvider apiKey="AIzaSyCXqDSiV34e_jSIURIbxavQ2sf6ESSG7xc" onLoad={() => console.log('Maps API has loaded.')}>
      <div className="relative w-screen h-screen">
        <FallDetectionAlert />
        <Map
          defaultZoom={13}
          defaultCenter={posisiLansia}
          mapId='da37f3254c6a6d1c'
          className="w-full h-full"
        >
          <Circle
            center={isEditMode ? center : { lat: homeLocation.latitude, lng: homeLocation.longitude }}
            radius={isEditMode ? radius : homeLocation.radius}
            draggable={isEditMode}
            editable={isEditMode}
            onCenterChanged={handleCenterChanged}
            onRadiusChanged={handleRadiusChanged}
            fillColor="#4CAF50"
            fillOpacity={0.2}
            strokeColor="#4CAF50"
            strokeWeight={2}
            strokeOpacity={0.8}
          />
          {!isEditMode && (
            <Route
              origin={{ lat: homeLocation.latitude, lng: homeLocation.longitude }}
              destination={posisiLansia}
            />
          )}
          <AdvancedMarker
            ref={houseMarkerRef}
            position={isEditMode ? center : { lat: homeLocation.latitude, lng: homeLocation.longitude }}
            onClick={() => setIsHouseInfoOpen(true)}
          >
            <div className="flex flex-col items-center justify-center p-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/609/609803.png"
                alt="House location"
                className="object-contain w-16 h-16"
              />
            </div>
          </AdvancedMarker>
          {isHouseInfoOpen && (
            <InfoWindow
              position={{ lat: homeLocation.latitude, lng: homeLocation.longitude }}
              onCloseClick={() => setIsHouseInfoOpen(false)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-800 mb-2">Home</h3>
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {homeLocation.nama || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> {new Date(homeLocation.time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Safe Radius:</strong> {homeLocation.radius}m
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  {isEditMode ? (
                    <button
                      onClick={() => {
                        handleSave();
                        setIsHouseInfoOpen(false);
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleEdit();
                        setIsHouseInfoOpen(false);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit Area
                    </button>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
          <AdvancedMarker
            ref={markerRef}
            position={posisiLansia}
            onClick={() => setInfoOpen(true)}
          >
            <div className={`flex flex-col items-center justify-center animate-pulse overflow-hidden cursor-pointer`}>
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Person location"
                className={`w-14 h-14 object-cover rounded-full ${isSOSActive ? 'border-4 border-red-500' : 'bg-white'}`}
              />
            </div>
          </AdvancedMarker>
          {infoOpen && (
            <InfoWindow
              position={posisiLansia}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-800 mb-2">Current Location</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Latitude:</strong> {posisiLansia.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Longitude:</strong> {posisiLansia.lng.toFixed(6)}
                  </p>
                  {isSOSActive && (
                    <div className="mt-2 py-1 px-2 bg-red-100 text-red-700 rounded text-sm">
                      ⚠️ SOS Mode Active
                    </div>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}

          {/* SOS Location Markers */}
          {sosLocations.map((location) => (
            <React.Fragment key={location.place_id}>
              <AdvancedMarker
                position={{ lat: location.geometry.location.lat, lng: location.geometry.location.lng }}
                onClick={() => setSelectedSOS(location.place_id)}
              >
                <div className="flex flex-col items-center justify-center rounded-lg p-1.5 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center animate-pulse">
                    <span className="text-sm">🏥</span>
                  </div>
                </div>
              </AdvancedMarker>
              {selectedSOS === location.place_id && (
                <InfoWindow
                  position={{ lat: location.geometry.location.lat, lng: location.geometry.location.lng }}
                  onCloseClick={() => setSelectedSOS(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-800 mb-2">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{location.vicinity}</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${location.geometry.location.lat},${location.geometry.location.lng}`,
                          '_blank'
                        )}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        Get Directions
                      </button>
                      <button
                        onClick={() => window.open(`tel:112`)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                      >
                        Emergency Call
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ))}
        </Map>

        {/* <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg animate-pulse">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping"></span>
            <span className="font-semibold">Terdeteksi Jatuh</span>
          </div>
        </div> */}
          <PersonCard
            homeLocation={homeLocation}
            isEditMode={isEditMode}
            onEdit={handleEdit}
            onSave={handleSave}
            onSOSStatusChange={handleSOSStatusChange}
            isSOSActive={isSOSActive}
            currentPosition={posisiLansia}
          />
        <div className="absolute top-20 right-4 z-20">
          <div className="flex flex-col gap-2">
            <NearbySOSLocation locations={sosLocations} onLocationsChange={setSosLocations} />
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default MapPage; 