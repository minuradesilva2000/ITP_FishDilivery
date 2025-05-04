import { api } from "../utils/api.js";

export const deliverRouteApi = {
  //deliver route management endpoints
  getAllRoutes: () => api.get("/route"),
  createNewRoute: (data) => api.post("/route", data),
};
