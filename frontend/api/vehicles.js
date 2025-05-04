import { api } from "../utils/api.js";

export const vehicleApi = {
  //vehicle management endpoints
  getAllVehicles: () => api.get("/vehicles"),
  createNewVehicle: (data) => api.post("/vehicles", data),
  updateVehicleData: (data, id) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
};
