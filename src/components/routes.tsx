import React, { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Polyline } from './polyline';

interface RouteProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

export const Route: React.FC<RouteProps> = ({ origin, destination }) => {
  const map = useMap();
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
    });

    // directionsService.route(
    //   {
    //     origin,
    //     destination,
    //     travelMode: google.maps.TravelMode.WALKING,
    //   },
    //   (result, status) => {
    //     if (status === google.maps.DirectionsStatus.OK && result) {
    //       const path = result.routes[0].overview_path.map((point) => ({
    //         lat: point.lat(),
    //         lng: point.lng(),
    //       }));
    //       setRoutePath(path);
    //       console.log(path);
    //     } else {
    //       console.error(`Directions request failed due to ${status}`);
    //     }
    //   }
    // );

    setRoutePath([{"lat":-5.36317,"lng":105.30664},{"lat":-5.363040000000001,"lng":105.30661},{"lat":-5.3630700000000004,"lng":105.30633},{"lat":-5.363090000000001,"lng":105.30610000000001},{"lat":-5.3631400000000005,"lng":105.30610000000001},{"lat":-5.3635,"lng":105.30604000000001},{"lat":-5.36359,"lng":105.30603},{"lat":-5.363670000000001,"lng":105.30595000000001},{"lat":-5.36437,"lng":105.30575},{"lat":-5.364540000000001,"lng":105.30574000000001},{"lat":-5.36535,"lng":105.30572000000001},{"lat":-5.365430000000001,"lng":105.30574000000001},{"lat":-5.365460000000001,"lng":105.30575},{"lat":-5.365460000000001,"lng":105.30581000000001},{"lat":-5.365530000000001,"lng":105.30581000000001},{"lat":-5.365830000000001,"lng":105.3058},{"lat":-5.365900000000001,"lng":105.3058},{"lat":-5.365950000000001,"lng":105.30571},{"lat":-5.36598,"lng":105.30566}])

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, origin, destination]);

  return routePath.length > 0 ? (
    <Polyline
      path={routePath}
      strokeColor="#0c4cb3"
      strokeOpacity={1}
      strokeWeight={4}
    />
  ) : null;
}; 