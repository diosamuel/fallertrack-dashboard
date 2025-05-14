import React, { useState, useEffect } from 'react';

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

interface NearbySOSLocationProps {
  locations: SOSLocation[];
  onLocationsChange: (locations: SOSLocation[]) => void;
}

const NearbySOSLocation: React.FC<NearbySOSLocationProps> = ({ locations, onLocationsChange }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNearbySOS = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://fallertrack.my.id/api/sos-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    radius: 5000
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch SOS locations');
            }

            const data = await response.json();
            onLocationsChange(data.results || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching SOS locations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNearbySOS();
            // Refresh data every 5 minutes when open
            const interval = setInterval(fetchNearbySOS, 300000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleOpen}
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
                <span className="text-xl">🏥</span>
                <span>Nearby SOS</span>
            </button>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm w-[300px] sm:w-[350px]">
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏥</span>
                        <h2 className="text-sm font-semibold text-gray-900">Nearby SOS Services</h2>
                    </div>
                    <button
                        onClick={toggleOpen}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>
                <div className="flex items-center justify-center p-4">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm w-[300px] sm:w-[350px]">
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏥</span>
                        <h2 className="text-sm font-semibold text-gray-900">Nearby SOS Services</h2>
                    </div>
                    <button
                        onClick={toggleOpen}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>
                <div className="p-3">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-red-600">{error}</p>
                        <button 
                            onClick={fetchNearbySOS}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm w-[300px] sm:w-[350px] max-h-[400px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏥</span>
                    <h2 className="text-sm font-semibold text-gray-900">Nearby SOS Services</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={fetchNearbySOS}
                        className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <span className="text-lg">🔄</span>
                    </button>
                    <button
                        onClick={toggleOpen}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
                {locations.length === 0 ? (
                    <div className="p-4 text-center">
                        <span className="text-3xl mb-2 block">🔍</span>
                        <p className="text-sm text-gray-500">No SOS services found nearby</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {locations.map((location) => (
                            <div 
                                key={location.place_id}
                                className="p-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-sm">📍</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {location.name}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                                            {location.vicinity}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-1">
                                        <button
                                            onClick={() => window.open(
                                                `https://www.google.com/maps/dir/?api=1&destination=${location.geometry.location.lat},${location.geometry.location.lng}`,
                                                '_blank'
                                            )}
                                            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Get Directions"
                                        >
                                            <span className="text-sm">🗺️</span>
                                        </button>
                                        <button
                                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Call Emergency"
                                        >
                                            <span className="text-sm">📞</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbySOSLocation; 