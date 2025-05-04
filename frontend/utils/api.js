// utils/api.js
import axios from "axios";
import { toast } from "../hooks/use-toast.js";

const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const handleSessionExpired = (user) => {
  localStorage.removeItem("user");

  toast({
    title: "Session Expired",
    description: "Please log in again to continue.",
    variant: "destructive",
  });

  // Determine redirect path based on user role
  const redirectPath =
    user?.role === "admin"
      ? "/"
      : user?.role === "driver"
      ? "/login/driver"
      : "/";

  // Use a short delay to ensure toast is visible
  setTimeout(() => {
    window.location.href = redirectPath;
  }, 2000);
};

const handleInsufficientPermissions = () => {
  localStorage.removeItem("user");

  toast({
    title: "Access Denied",
    description: "You don't have permission to perform this action.",
    variant: "destructive",
  });

  setTimeout(() => {
    window.location.href = "/";
  }, 2000);
};

api.interceptors.request.use(
  (config) => {
    // Add any request processing here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get stored user info
    let user = null;
    try {
      const storedUser = localStorage.getItem("user");
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }

    // Handle different error scenarios
    if (error.response) {
      switch (error.response.status) {
        case 401:
          handleSessionExpired(user);
          break;

        case 403:
          handleInsufficientPermissions();
          break;

        case 404:
          toast({
            title: "Not Found",
            description: "The requested resource was not found.",
            variant: "destructive",
          });
          break;

        case 422:
          toast({
            title: "Validation Error",
            description:
              error.response.data?.message || "Please check your input.",
            variant: "destructive",
          });
          break;

        case 500:
          toast({
            title: "Server Error",
            description: "Something went wrong. Please try again later.",
            variant: "destructive",
          });
          break;

        default:
          toast({
            title: "Error",
            description:
              error.response.data?.message || "An unexpected error occurred.",
            variant: "destructive",
          });
      }
    } else if (error.request) {
      // Network error
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    } else {
      // Something else happened
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
