import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">About Our Location Tracking System</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Real-Time Location Tracking</h2>
                <p className="text-gray-600">
                  Our advanced location tracking system provides real-time monitoring capabilities, 
                  allowing you to track and visualize movement patterns with high precision. 
                  The system uses Google Maps Platform to deliver accurate location data and route visualization.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Features</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Real-time location updates</li>
                  <li>Route visualization and tracking</li>
                  <li>Interactive map interface</li>
                  <li>Customizable radius and boundaries</li>
                  <li>Emergency detection system</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Technology Stack</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Frontend</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>React.js</li>
                      <li>Tailwind CSS</li>
                      <li>Google Maps Platform</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">APIs & Services</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li>Google Maps JavaScript API</li>
                      <li>Google Routes API</li>
                      <li>Real-time Location Services</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 