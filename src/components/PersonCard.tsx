import React, { useState, useEffect } from "react";
// import { IconHeart } from '@tabler/icons-react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Alert, Snackbar } from '@mui/material';
import { API_ENDPOINTS } from '../config/api';
// import NearbySOSLocation from './NearbySOSLocation';

interface HomeLocation {
  latitude: number;
  longitude: number;
  radius: number;
  nama: string;
  time: string;
}

interface ActivitySummary {
  gps: {
    summary: string;
    steps: string[];
  };
  fallDetection: {
    summary: string;
    steps: string[];
  };
  currentDistance: {
    summary: string;
    steps: string[];
  };
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
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Dummy data for the last 7 days
  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stepsData = [4500, 5200, 3800, 6000, 4800, 3500, 4200];
  const heartRateData = [75, 82, 78, 85, 80, 88, 76];

  // Function to fetch activity summary
  const fetchActivitySummary = async () => {
    setLoadingActivity(true);
    setActivityError(null);
    try {
      const response = await fetch(API_ENDPOINTS.SUMMARIZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 50,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity summary');
      }

      const data = await response.json();
      console.log(data)
      setActivitySummary(JSON.parse(data.text.replace('```json', '').replace('```', '')) || 'No activity data available');
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : 'Failed to load activity summary');
      console.error('Error fetching activity summary:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch activity summary on component mount and every 5 minutes
  useEffect(() => {
    fetchActivitySummary();
    const interval = setInterval(fetchActivitySummary, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleSOSClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = !isSOSActive;
    console.log("SOS button clicked, new status:", newStatus);

    try {
      const response = await fetch(API_ENDPOINTS.ALERT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sos: !sosAlert
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update SOS status');
      }

      setSosAlert(!true);
      onSOSStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating SOS status:', error);
      // You might want to show an error alert here
    }
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

  const renderActivitySection = (title: string, data: { summary: string; steps: string[] }) => (
    <div className="mb-4 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 italic">
          {data.summary}
        </p>
        <ul className="list-disc list-inside space-y-1">
          {data.steps.map((step, index) => (
            <li key={index} className="text-sm text-gray-700">
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Information Card - Left Bottom */}
      <div
        id="information"
        className="rounded-lg shadow-lg p-3 bg-white absolute z-10 left-4 bottom-8 max-w-sm"
      >
        <div className="flex items-center gap-4 mb-2">
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Linda Nasution" className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow" />
          <div>
            <div className="font-semibold text-lg text-gray-800">Ms Elderina</div>
            <div className="flex gap-2 mt-1">
              <span className="badge badge-neutral gap-1">80 years</span>
              <span className="badge badge-neutral gap-1">Alzheimer</span>
            </div>
          </div>
        </div>

        {/* Current Position */}
        {currentPosition && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
            <div className="font-semibold text-sm mb-2 text-gray-700">Current Position</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <span className="ml-1 font-mono text-gray-800">{currentPosition.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <span className="ml-1 font-mono text-gray-800">{currentPosition.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <h1 className="font-semibold mb-1 text-gray-700 text-sm">Description</h1>
          <div className="text-sm text-gray-600 leading-snug">
            <ul className="list-disc list-inside space-y-1">
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
        {/* Activity Card - Right Bottom */}
        <div
          id="activity"
          className="mt-4 h-72 overflow-scroll"
        >
          <div className="sticky top-0 bg-white pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-black">Activity Patient Summary</h2>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>
              <button
                onClick={fetchActivitySummary}
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-1"
              >
                <span>🔄</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loadingActivity ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activityError ? (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                <p>{activityError}</p>
                <button
                  onClick={fetchActivitySummary}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm underline"
                >
                  Try again
                </button>
              </div>
            ) : activitySummary ? (
              <div className="space-y-4 px-1">
                {renderActivitySection("Location Updates", activitySummary.gps)}
                {renderActivitySection("Fall Detection", activitySummary.fallDetection)}
                {renderActivitySection("Distance Tracking", activitySummary.currentDistance)}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No activity data available
              </div>
            )}
          </div>
        </div>
        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSOSClick}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              isSOSActive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                : 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50'
            }`}
          >
            {isSOSActive ? 'Deactivate SOS Alert' : 'Send SOS Alert'}
          </button>
        </div>
      </div>



      {/* Alerts */}
      <Snackbar
        open={notifyAlert}
        autoHideDuration={6000}
        onClose={handleCloseNotify}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'absolute',
          top: '16px',
          left: '50% !important',
          transform: 'translateX(-50%)',
          width: 'auto'
        }}
      >
        <Alert onClose={handleCloseNotify} severity="success" sx={{ width: '100%', backgroundColor: '#fff', color: '#2e7d32' }}>
          Location updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={sosAlert}
        autoHideDuration={10000}
        onClose={handleCloseSOS}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'absolute',
          top: '16px',
          left: '50% !important',
          transform: 'translateX(-50%)',
          width: 'auto'
        }}
      >
        <Alert onClose={handleCloseSOS} severity="error" sx={{ width: '100%', backgroundColor: '#fff', color: '#d32f2f' }}>
          SOS mode activated! Emergency services have been notified.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PersonCard; 