import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import LeftImg from "../../assets/images/web-tyre-case.jpg";
import { deliverRouteApi } from "../../../api/deliverRoutes.js";
import LoadingScreen from "../../components/ui/loadingScreen.jsx";
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

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_KEY = "5b3ce3597851110001cf62485bf374c17cc74d9c9bd5df5365820280";

const RouteManagement = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    routeName: "",
    routeSlug: "",
    startLocation: "",
    endLocation: "",
  });
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [endCoordinates, setEndCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [endSearchResults, setEndSearchResults] = useState([]);

  // Function to fetch place suggestions based on user input
  const fetchPlaceSuggestions = async (query, isStart) => {
    if (!query) {
      isStart ? setStartSearchResults([]) : setEndSearchResults([]);
      return;
    }

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.features) {
        isStart
          ? setStartSearchResults(data.features)
          : setEndSearchResults(data.features);
      }
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  // Function to fetch coordinates for a place
  const fetchCoordinates = async (placeName) => {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
      placeName
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        return { latitude: coordinates[1], longitude: coordinates[0] };
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  // Handle place selection
  const handlePlaceSelect = async (place, isStart) => {
    const coordinates = await fetchCoordinates(place.properties.label);

    if (coordinates) {
      if (isStart) {
        setStartPlace(place.properties.label);
        setStartCoordinates(coordinates);
        setStartSearchResults([]);
      } else {
        setEndPlace(place.properties.label);
        setEndCoordinates(coordinates);
        setEndSearchResults([]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = {
        routeName: formData.routeName,
        routeSlug: formData.routeSlug,
        startLocation: startCoordinates,
        endLocation: endCoordinates,
      };

      await deliverRouteApi.createNewRoute(formDataToSend);
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-4xl">
        {/* Left Image */}
        <div className="w-1/2">
          <img
            src={LeftImg}
            className="h-full w-full object-cover rounded-l-2xl"
            alt="Route"
          />
        </div>

        {/* Right Content */}
        <div className="w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Route Management
          </h2>

          <div className="mb-4 relative">
            <Label className="text-gray-700 font-medium">Start Place:</Label>
            <Input
              type="text"
              value={startPlace}
              onChange={(e) => {
                setStartPlace(e.target.value);
                fetchPlaceSuggestions(e.target.value, true);
              }}
              className="mt-1 h-10"
            />
            {startSearchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto border border-gray-300">
                {startSearchResults.map((result) => (
                  <li
                    key={result.id}
                    onClick={() => handlePlaceSelect(result, true)}
                    className="p-2 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {result.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* End Place */}
          <div className="mb-4 relative">
            <Label className="text-gray-700 font-medium">End Place:</Label>
            <Input
              type="text"
              value={endPlace}
              onChange={(e) => {
                setEndPlace(e.target.value);
                fetchPlaceSuggestions(e.target.value, false);
              }}
              className="mt-1"
            />
            {endSearchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto border border-gray-300">
                {endSearchResults.map((result) => (
                  <li
                    key={result.id}
                    onClick={() => handlePlaceSelect(result, false)}
                    className="p-2 cursor-pointer hover:bg-gray-200 transition"
                  >
                    {result.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Route Name */}
          <div className="mb-4">
            <Label className="text-gray-700 font-medium">Route Name:</Label>
            <Input
              name="routeName"
              value={formData.routeName}
              onChange={handleInputChange}
              placeholder="Enter route name"
              required
              className="mt-1"
            />
          </div>

          {/* Route Slug */}
          <div className="mb-6">
            <Label className="text-gray-700 font-medium">Route Slug:</Label>
            <Input
              name="routeSlug"
              value={formData.routeSlug}
              onChange={handleInputChange}
              placeholder="Enter route slug"
              required
              className="mt-1"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full py-2 text-lg font-medium"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Loading Screen */}
      {loading && <LoadingScreen />}
    </div>
  );
};

export default RouteManagement;
