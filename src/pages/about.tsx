import React, { useState, useEffect } from 'react';
import DeviceOrientation from '../components/DeviceOrientation';

const AboutPage = () => {
  const [deviceData, setDeviceData] = useState({
    acceleration: {
      x: 9.64,
      y: -1.22,
      z: 0.27
    },
    rotation: {
      x: 0.05,
      y: -0.01,
      z: 0.02
    },
    timestamp: new Date().toLocaleTimeString()
  });

  // Simulate data updates (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Add some random variation to simulate real device movement
      setDeviceData(prev => ({
        acceleration: {
          x: prev.acceleration.x + (Math.random() - 0.5) * 0.2,
          y: prev.acceleration.y + (Math.random() - 0.5) * 0.2,
          z: prev.acceleration.z + (Math.random() - 0.5) * 0.2
        },
        rotation: {
          x: prev.rotation.x + (Math.random() - 0.5) * 0.01,
          y: prev.rotation.y + (Math.random() - 0.5) * 0.01,
          z: prev.rotation.z + (Math.random() - 0.5) * 0.01
        },
        timestamp: new Date().toLocaleTimeString()
      }));
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Device Motion Visualization</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Visualization */}
          <div>
            <DeviceOrientation data={deviceData} />
          </div>

          {/* Explanation */}
          <div className="bg-blue-950 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">About the Visualization</h2>
            <div className="space-y-4 text-sm">
              <p>
                This visualization shows the real-time orientation and acceleration of the device:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="text-red-400">Red line</span> represents X-axis acceleration
                </li>
                <li>
                  <span className="text-green-400">Green line</span> represents Y-axis acceleration
                </li>
                <li>
                  <span className="text-blue-400">Blue dot</span> represents Z-axis acceleration
                </li>
              </ul>
              <p className="mt-4">
                The box rotates based on the device's rotation data, and the intensity of the glow
                indicates the magnitude of acceleration.
              </p>
              <div className="mt-6 p-4 bg-blue-900 rounded-lg">
                <h3 className="font-medium mb-2">Current Data</h3>
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(deviceData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 