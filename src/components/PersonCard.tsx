import React, { useState } from "react";
// import { IconHeart } from '@tabler/icons-react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Alert, Snackbar } from '@mui/material';
// import NearbySOSLocation from './NearbySOSLocation';

interface HomeLocation {
  latitude: number;
  longitude: number;
  radius: number;
  nama: string;
  time: string;
}

interface PersonCardProps {
  homeLocation?: HomeLocation;
  isEditMode?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onSOSStatusChange: (status: boolean) => void;
  isSOSActive: boolean;
  currentPosition?: {
    lat: number;
    lng: number;
  };
}

const PersonCard: React.FC<PersonCardProps> = ({
  homeLocation,
  isEditMode = false,
  onEdit,
  onSave,
  onSOSStatusChange,
  isSOSActive,
  currentPosition
}) => {
  const [notifyAlert, setNotifyAlert] = useState(false);
  const [sosAlert, setSosAlert] = useState(false);

  // Dummy data for the last 7 days
  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stepsData = [4500, 5200, 3800, 6000, 4800, 3500, 4200];
  const heartRateData = [75, 82, 78, 85, 80, 88, 76];

  const handleSOSClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = !isSOSActive;
    console.log("SOS button clicked, new status:", newStatus);
    setSosAlert(true);
    onSOSStatusChange(newStatus);
  };

  const handleCloseNotify = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log("Closing notify alert", reason);
    setNotifyAlert(false);
  };

  const handleCloseSOS = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log("Closing SOS alert", reason);
    setSosAlert(false);
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleSave = () => {
    onSave?.();
  };

  return (
    <>
      <div className="tabs tabs-boxed w-fit">
        <input type="radio" name="my_tabs_3" className="tab" aria-label="SOS" defaultChecked />
        <div className="tab-content border-base-300 p-6">
          <div className="flex items-center gap-4 mb-2">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Linda Nasution" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
            <div>
              <div className="font-semibold text-lg">Ms Elderina</div>
              <div className="flex gap-2 mt-1">
                {/* <span className="badge badge-neutral gap-1"><IconHeart size={16} className="text-red-500" /> 80 years</span> */}
                {/* <span className="badge badge-neutral gap-1"><IconHeart size={16} className="text-red-500" /> Alzheimer</span> */}
              </div>
            </div>
          </div>

          {/* Current Position */}
          {currentPosition && (
            <div className="mt-4 p-3 bg-blue-950 rounded-lg">
              <div className="font-semibold text-sm mb-2">Current Position</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-white">Latitude:</span>
                  <span className="ml-1 font-mono">{currentPosition.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-white">Longitude:</span>
                  <span className="ml-1 font-mono">{currentPosition.lng.toFixed(6)}</span>
                </div>
              </div>
              <button
                onClick={() => window.open(
                  `https://www.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`,
                  '_blank'
                )}
                className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
              >
                <span>🗺️</span>
                View on Map
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mt-4">
            <div className="font-semibold mb-1">Deskripsi</div>
            <div className="text-sm text-white leading-snug">
              <ul className="list-disc list-inside">
                <li>Wearing white clothes</li>
                <li>80 years old</li>
                <li>Has Alzheimer's history</li>
                <li>Height: 165 cm</li>
                <li>Weight: 60 kg</li>
                <li>Has birthmark on right cheek</li>
                <li>Wears reading glasses</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSOSClick}
              className={`btn btn-block border-none cursor-pointer transition-colors duration-200 ${isSOSActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              {isSOSActive ? 'Nonaktifkan SOS' : 'Aktifkan SOS'}
            </button>
          </div>
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Activity" />
        <div className="tab-content border-base-300 p-6">
          <p>Resume Activity Here</p>
        </div>

        <input type="radio" name="my_tabs_3" className="tab" aria-label="Location" />
        <div className="tab-content border-base-300 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Home Location</h3>
              <div>
                {homeLocation ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Latitude</p>
                        <p className="text-sm font-mono">{homeLocation.latitude}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Longitude</p>
                        <p className="text-sm font-mono">{homeLocation.longitude}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Radius</p>
                      <p className="text-sm">{homeLocation.radius}m</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Location Name</p>
                      <p className="text-sm">{homeLocation.nama}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Last updated: {new Date(homeLocation.time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      {isEditMode ? (
                        <button
                          onClick={handleSave}
                          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <span>💾</span>
                          Save Circle
                        </button>
                      ) : (
                        <button
                          onClick={handleEdit}
                          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <span>✏️</span>
                          Edit Circle
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="text-4xl mb-2 block">🏠</span>
                    <p className="text-gray-500 font-medium">No home location set</p>
                    <p className="text-sm text-gray-400 mt-1">Set your home location to enable location tracking</p>
                    <button
                      onClick={handleEdit}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                      <span>📍</span>
                      Set Home Location
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Alerts */}
      <Snackbar open={notifyAlert} autoHideDuration={6000} onClose={handleCloseNotify}>
        <Alert onClose={handleCloseNotify} severity="success" sx={{ width: '100%' }}>
          Location updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={sosAlert} autoHideDuration={6000} onClose={handleCloseSOS}>
        <Alert onClose={handleCloseSOS} severity="error" sx={{ width: '100%' }}>
          SOS mode activated! Emergency services have been notified.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PersonCard; 