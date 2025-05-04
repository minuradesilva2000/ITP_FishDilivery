import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker icon images
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { deliverRouteApi } from "../../../api/deliverRoutes";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_KEY = "5b3ce3597851110001cf62485bf374c17cc74d9c9bd5df5365820280";

const RouteMap = () => {
  const [fetchedRoutes, setFetchedRoutes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedRoutes = fetchedRoutes.map((route, index) => ({
    id: index + 1,
    name: route.routeName,
    start: [route.startLocation.latitude, route.startLocation.longitude],
    end: [route.endLocation.latitude, route.endLocation.longitude],
    color: ["blue", "green", "red", "orange", "purple"][index % 5],
  }));

  console.log(formattedRoutes);
  // // Array of route definitions (start and end points)
  // const routeDefinitions = [
  //   {
  //     id: 1,
  //     name: "Colombo to Kandy",
  //     start: [6.9271, 79.8612],
  //     end: [7.2906, 80.6337],
  //     color: "blue",
  //   },
  //   {
  //     id: 2,
  //     name: "Colombo to Galle",
  //     start: [6.9271, 79.8612],
  //     end: [6.0535, 80.221],
  //     color: "green",
  //   },
  //   {
  //     id: 3,
  //     name: "Kandy to Nuwara Eliya",
  //     start: [7.2906, 80.6337],
  //     end: [6.9497, 80.7891],
  //     color: "red",
  //   },
  // ];
  useEffect(() => {
    fetchAllDeliverRoutes();
  }, []);

  const fetchAllDeliverRoutes = async () => {
    try {
      const routes = await deliverRouteApi.getAllRoutes();
      setFetchedRoutes(routes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchAllRoutes = async () => {
      try {
        setLoading(true);
        const routePromises = formattedRoutes.map(async (routeDef) => {
          console.log(routeDef);
          const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${routeDef.start[1]},${routeDef.start[0]}&end=${routeDef.end[1]},${routeDef.end[0]}`;

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`API request failed for route ${routeDef.id}`);
          }

          const data = await response.json();

          if (!data?.features?.[0]?.geometry?.coordinates) {
            throw new Error(`Invalid API response for route ${routeDef.id}`);
          }

          const routeCoordinates = data.features[0].geometry.coordinates.map(
            (coord) => [coord[1], coord[0]]
          );

          const distance = (
            data.features[0].properties.segments[0].distance / 1000
          ).toFixed(1);
          const duration = (
            data.features[0].properties.segments[0].duration / 60
          ).toFixed(1);

          return {
            ...routeDef,
            coordinates: routeCoordinates,
            distance,
            duration,
          };
        });

        const fetchedRoutes = await Promise.all(routePromises);
        setRoutes(fetchedRoutes);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRoutes();
  }, [fetchedRoutes]);

  // Calculate map bounds to fit all routes
  const calculateBounds = () => {
    if (routes.length === 0) return null;

    let allPoints = [];
    routes.forEach((route) => {
      allPoints = [...allPoints, route.start, route.end, ...route.coordinates];
    });

    return L.latLngBounds(allPoints);
  };

  const bounds = calculateBounds();

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <h2>Multiple Routes in Sri Lanka</h2>

      {loading && <p>Loading routes...</p>}
      {error && (
        <p className="error-message" style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className=" rounded-2xl z-0">
            <MapContainer
              bounds={bounds}
              style={{ height: "500px", width: "100%", marginTop: "20px" }}
              whenCreated={(map) => {
                // Add slight padding to the bounds
                if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Render all routes */}
              {routes.map((route) => (
                <React.Fragment key={route.id}>
                  <Polyline
                    positions={route.coordinates}
                    color={route.color}
                    weight={5}
                    opacity={0.7}
                  />
                  <Marker position={route.start}>
                    <Popup>
                      {route.name} Start
                      <br />
                      Distance: {route.distance} km
                      <br />
                      Duration: {route.duration} min
                    </Popup>
                  </Marker>
                  <Marker position={route.end}>
                    <Popup>
                      {route.name} End
                      <br />
                      Distance: {route.distance} km
                      <br />
                      Duration: {route.duration} min
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
          </div>

          {/* Route information table */}
          <div style={{ marginTop: "20px" }}>
            <h3>Route Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Route
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Distance (km)
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Duration (min)
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {route.name}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {route.distance}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {route.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteMap;
