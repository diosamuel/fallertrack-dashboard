import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FallNotifications = () => {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('https://fallertrack.my.id/api/current-distance', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleToggleRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    let intervalId;
    if (isAutoRefresh) {
      // Set up interval for auto-refresh every 5 seconds only if auto-refresh is enabled
      intervalId = setInterval(fetchNotifications, 5000);
    }

    // Cleanup function to clear interval when component unmounts or auto-refresh is disabled
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoRefresh]); // Add isAutoRefresh to dependency array to restart interval when it changes

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Distance Notifications</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {isAutoRefresh ? 'Auto-refreshing every 5 seconds' : 'Auto-refresh paused'}
          </span>
          <button
            onClick={handleToggleRefresh}
            className={`btn btn-sm ${isAutoRefresh ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white border-none`}
          >
            {isAutoRefresh ? 'Pause Refresh' : 'Start Refresh'}
          </button>
          <button
            onClick={fetchNotifications}
            className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white border-none"
          >
            Refresh Now
          </button>
        </div>
      </div>
      <pre className="bg-gray-50 p-4 rounded overflow-auto">
        {JSON.stringify(notifications, null, 2)}
      </pre>
    </div>
  );
};

export default FallNotifications; 