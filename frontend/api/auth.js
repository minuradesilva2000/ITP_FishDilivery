import { api } from "../utils/api.js";

export const authApi = {
  //user auth endpoints
  adminLogin: (data) => api.post("/auth/login", data),
};
