/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';

import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import './index.css';

import { Circle } from './components/circle'
import PersonCard from './components/PersonCard';
import PoiMarkers from './components/PoiMarkers';

type Poi = { key: string, location: google.maps.LatLngLiteral }
const locations: Poi[] = [
  { key: 'monasJakarta', location: { lat: -6.175394, lng: 106.827183 } },
  { key: 'ancol', location: { lat: -6.126066, lng: 106.857910 } },
  { key: 'thamrinCity', location: { lat: -6.193124, lng: 106.818001 } },
  { key: 'grandIndonesia', location: { lat: -6.195599, lng: 106.823024 } },
  { key: 'plazaIndonesia', location: { lat: -6.193853, lng: 106.821160 } },
  { key: 'plazaSenayan', location: { lat: -6.225588, lng: 106.799515 } },
  { key: 'ragunan', location: { lat: -6.307755, lng: 106.820320 } },
  { key: 'tmiiJakarta', location: { lat: -6.302445, lng: 106.895516 } },
  { key: 'kotaTua', location: { lat: -6.137646, lng: 106.817032 } },
  { key: 'museumNasional', location: { lat: -6.176389, lng: 106.821920 } },
  { key: 'istiqlalMosque', location: { lat: -6.170144, lng: 106.830925 } },
  { key: 'bundaran_hi', location: { lat: -6.195051, lng: 106.823127 } },
  { key: 'dufanAncol', location: { lat: -6.125411, lng: 106.833251 } },
  { key: 'seaWorld', location: { lat: -6.122857, lng: 106.845454 } },
  { key: 'kemang', location: { lat: -6.260871, lng: 106.813559 } },
];

const App = () => {

  const [center, setCenter] = useState({ lat: -6.200000, lng: 106.816666 });
  const [radius, setRadius] = useState(400);
  const [infoOpen, setInfoOpen] = useState(false);
  const markerPosition = { lat: -6.200000, lng: 106.816666 };

  const handleCenterChanged = useCallback((newCenter) => {
    setCenter({
      lat: newCenter.lat(),
      lng: newCenter.lng()
    });
  }, []);

  const handleRadiusChanged = useCallback((newRadius) => {
    // Limit radius to 500 meters
    setRadius(Math.min(newRadius, 500));
  }, []);

  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <APIProvider apiKey="AIzaSyCXqDSiV34e_jSIURIbxavQ2sf6ESSG7xc" onLoad={() => console.log('Maps API has loaded.')}>
        <div className="relative w-screen h-screen">
          <Map
            defaultZoom={13}
            defaultCenter={center}
            onCameraChanged={(ev: MapCameraChangedEvent) =>
              console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }
            mapId='da37f3254c6a6d1c'
            className="w-full h-full"
          >
            <Circle
              center={center}
              radius={radius}
              draggable={true}
              editable={true}
              onCenterChanged={handleCenterChanged}
              onRadiusChanged={handleRadiusChanged}
            />
            <AdvancedMarker
              ref={markerRef}
              position={markerPosition}
              onClick={() => setInfoOpen(true)}
            >
              <div className="w-12 h-12 rounded-full border-2 animate-pulse border-white shadow-lg overflow-hidden cursor-pointer">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Person location"
                  className="w-full h-full object-cover"
                />
              </div>
            </AdvancedMarker>
            <PoiMarkers pois={locations} />
          </Map>

          {infoOpen && (
            <InfoWindow
              position={markerPosition}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-2">
                <div className="font-bold">Linda Nasution</div>
                <div className="text-sm text-gray-600">80 years • Alzheimer</div>
              </div>
            </InfoWindow>
          )}

          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg animate-pulse">
              <span className="inline-block w-2 h-2 bg-white rounded-full animate-ping"></span>
              <span className="font-semibold">Terdeteksi Jatuh</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-10">
            <PersonCard />
          </div>
        </div>
      </APIProvider>
    </>
  )
}

export default App;

const root = createRoot(document.getElementById('app'));
root.render(
  <App />
);

