import React from 'react';

interface DeviceData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: string;
}

interface DeviceOrientationProps {
  data: DeviceData;
}

const DeviceOrientation: React.FC<DeviceOrientationProps> = ({ data }) => {
  // Calculate rotation angles for visualization
  const rotationX = data.rotation.x * (180 / Math.PI); // Convert rad to degrees
  const rotationY = data.rotation.y * (180 / Math.PI);
  const rotationZ = data.rotation.z * (180 / Math.PI);

  // Calculate acceleration magnitude for color intensity
  const accelMagnitude = Math.sqrt(
    Math.pow(data.acceleration.x, 2) +
    Math.pow(data.acceleration.y, 2) +
    Math.pow(data.acceleration.z, 2)
  );
  
  // Normalize acceleration for color intensity (assuming max acceleration is around 10 m/s²)
  const intensity = Math.min(accelMagnitude / 10, 1);

  return (
    <div className="p-4 bg-blue-950 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Device Orientation</h3>
        <div className="text-sm text-gray-300">
          Last Update: {data.timestamp}
        </div>
      </div>

      {/* 3D Device Visualization */}
      <div className="relative w-48 h-48 mx-auto mb-4 perspective-1000">
        <div 
          className="absolute w-full h-full transition-transform duration-300"
          style={{
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Device Box */}
          <div 
            className="absolute w-full h-full border-2 rounded-lg"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${0.1 + intensity * 0.2})`,
              borderColor: `rgba(255, 255, 255, ${0.3 + intensity * 0.7})`,
              boxShadow: `0 0 ${10 + intensity * 20}px rgba(255, 255, 255, ${0.2 + intensity * 0.3})`
            }}
          >
            {/* Acceleration Vectors */}
            <div className="absolute inset-0">
              {/* X-axis (Red) */}
              <div 
                className="absolute h-1 bg-red-500 origin-left"
                style={{
                  width: `${Math.abs(data.acceleration.x) * 10}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translateY(-50%) ${data.acceleration.x > 0 ? 'rotate(0deg)' : 'rotate(180deg)'}`,
                  opacity: 0.7
                }}
              />
              {/* Y-axis (Green) */}
              <div 
                className="absolute w-1 bg-green-500 origin-top"
                style={{
                  height: `${Math.abs(data.acceleration.y) * 10}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translateX(-50%) ${data.acceleration.y > 0 ? 'rotate(0deg)' : 'rotate(180deg)'}`,
                  opacity: 0.7
                }}
              />
              {/* Z-axis (Blue) */}
              <div 
                className="absolute w-1 h-1 bg-blue-500 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 ${Math.abs(data.acceleration.z) * 5}px rgba(59, 130, 246, 0.8)`,
                  opacity: 0.7
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Acceleration (m/s²)</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">X:</span>
              <span className="font-mono text-white">{data.acceleration.x.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Y:</span>
              <span className="font-mono text-white">{data.acceleration.y.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-400">Z:</span>
              <span className="font-mono text-white">{data.acceleration.z.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Rotation (rad/s)</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">X:</span>
              <span className="font-mono text-white">{data.rotation.x.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Y:</span>
              <span className="font-mono text-white">{data.rotation.y.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-400">Z:</span>
              <span className="font-mono text-white">{data.rotation.z.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceOrientation; 