import React, { useState, useEffect } from 'react';
import { 
  IconAlertTriangle, 
  IconMapPin, 
  IconClock, 
  IconPhone, 
  IconMessage 
} from '@tabler/icons-react';

interface EmergencyContact {
  callStatus: boolean;
  messageStatus: boolean;
}

interface ElderlyInfo {
  name: string;
  emergencyContact: EmergencyContact;
}

interface NotificationStatus {
  call: string;
  message: string;
}

interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface FallDetectionStatus {
  status: boolean;
  message: string;
  timestamp: Timestamp;
}

interface FallNotification {
  latitude: number;
  longitude: number;
  elderlyInfo: ElderlyInfo;
  notificationStatus: NotificationStatus;
  fallDetectionStatus: FallDetectionStatus;
  timestamp: string;
}

const FallDetectionAlert: React.FC = () => {
  const [fallData, setFallData] = useState<FallNotification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFallNotification = async () => {
    try {
      const response = await fetch('https://fallertrack.my.id/api/fall-notification', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fall notification');
      }

      const data = await response.json();
      setFallData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fall notification');
      console.error('Error fetching fall notification:', err);
    }
  };

  useEffect(() => {
    fetchFallNotification();
    // Fetch every 5 seconds
    const interval = setInterval(fetchFallNotification, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!fallData?.fallDetectionStatus.status) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative">
        {/* Outer ping animation */}
        <div className="absolute -inset-2">
          <div className="w-full h-full bg-red-500 rounded-lg opacity-75 animate-ping"></div>
        </div>
        
        {/* Main alert box */}
        <div className="relative bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <IconAlertTriangle className="w-8 h-8 animate-pulse" stroke={2} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                Fall Detected!
              </h3>
              <p className="text-sm opacity-90">{fallData.elderlyInfo.name} has fallen</p>
              
              <div className="mt-3 text-sm space-y-1 opacity-80">
                <p className="flex items-center gap-2">
                  <IconMapPin className="w-4 h-4" />
                  <span>Location: {fallData.latitude.toFixed(6)}, {fallData.longitude.toFixed(6)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <IconClock className="w-4 h-4" />
                  <span>Time: {new Date(fallData.timestamp).toLocaleString()}</span>
                </p>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {fallData.notificationStatus.call && (
                  <div className="flex items-center gap-2">
                    <IconPhone className="w-4 h-4" />
                    <span>{fallData.notificationStatus.call}</span>
                  </div>
                )}
                {fallData.notificationStatus.message && (
                  <div className="flex items-center gap-2">
                    <IconMessage className="w-4 h-4" />
                    <span>{fallData.notificationStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallDetectionAlert; 