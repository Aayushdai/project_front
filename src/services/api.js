import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true, // for Django session auth
});

// Add JWT token to request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = (data) => API.post("/login/", data);
export const getTrips = () => API.get("trips/trips/");
export default API;