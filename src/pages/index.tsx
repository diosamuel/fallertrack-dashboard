import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';

import { Circle, type CircleProps } from '../components/circle';
import { Route } from '../components/routes';
import PersonCard from '../components/PersonCard';

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

const MapPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null);
  const [center, setCenter] = useState<LatLngLiteral | null>(null);
  const [radius, setRadius] = useState(400);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [posisiLansia, setPosisiLansia] = useState<LatLngLiteral>({ lat: -5.363431060686779, lng:  105.3068113236821 });

  // Fetch home location data
  useEffect(() => {
    const fetchHomeLocation = async () => {
      try {
        const response = await axios.get('https://fallertrack-backend-tvxyots97-reannn22s-projects.vercel.app/api/home', {
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
        const response = await axios.get('https://fallertrack-backend-tvxyots97-reannn22s-projects.vercel.app/api/current-distance', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const { latitude, longitude } = response.data;
        console.log('Current location updated:', { latitude, longitude });
        setPosisiLansia({ lat: latitude, lng: longitude });
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

    // Set up interval for auto-refresh every 3 seconds
    const intervalId = setInterval(fetchCurrentLocation, 3000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
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

  const handleSave = useCallback(() => {
    if (center && homeLocation) {
      // Update home location with new coordinates
      setHomeLocation({
        ...homeLocation,
        latitude: center.lat,
        longitude: center.lng,
        radius: radius
      });
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
    return <div className="w-screen h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <APIProvider apiKey="AIzaSyCXqDSiV34e_jSIURIbxavQ2sf6ESSG7xc" onLoad={() => console.log('Maps API has loaded.')}>
      <div className="relative w-screen h-screen">
        <Map
          defaultZoom={13}
          defaultCenter={center}
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
          >
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-1">
              <img
                src="https://cdn-icons-png.flaticon.com/512/609/609803.png"
                alt="House location"
                className="object-contain w-10 h-10"
              />
              <h1>Panti Lansia</h1>
            </div>
          </AdvancedMarker>
          <AdvancedMarker
            ref={markerRef}
            position={posisiLansia}
            onClick={() => setInfoOpen(true)}
          >
            <div className={`flex flex-col items-center justify-center animate-pulse overflow-hidden cursor-pointer ${isSOSActive ? 'bg-red-500 rounded-lg p-2' : ''}`}>
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Person location"
                className={`w-12 h-12 object-cover rounded-full ${isSOSActive ? 'border-2 border-white' : 'bg-white'}`}
              />
              <h1 className={`${isSOSActive ? 'text-white' : 'bg-white'} rounded-lg p-1 mt-1`}>
                {isSOSActive ? 'SOS Aktif!' : 'Lansia'}
              </h1>
            </div>
          </AdvancedMarker>
        </Map>

        {/* <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg animate-pulse">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping"></span>
            <span className="font-semibold">Terdeteksi Jatuh</span>
          </div>
        </div> */}
        <div className="absolute z-10 md:bottom-4 md:right-4 md:left-4 bottom-0 left-0 right-0">
          <PersonCard 
            onSOSStatusChange={handleSOSStatusChange}
            isSOSActive={isSOSActive}
          />
        </div>
        <div className="absolute top-4 right-4 z-20">
          <div className="flex flex-col gap-2">
            <div className="bg-white p-2 rounded-lg text-black">
              {homeLocation && (
                <>
                  <h1 className="text-sm font-semibold">Home Location:</h1>
                  <p className="text-xs">Lat: {homeLocation.latitude}</p>
                  <p className="text-xs">Lng: {homeLocation.longitude}</p>
                  <p className="text-xs">Radius: {homeLocation.radius}m</p>
                  <p className="text-xs mt-1">{homeLocation.nama}</p>
                  <p className="text-xs text-gray-500">Last updated: {new Date(homeLocation.time).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-4 z-20">
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
              >
                Save Circle
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
              >
                Edit Circle
              </button>
            )}
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default MapPage; 