import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://seasidemiseajour2-0.onrender.com/api",
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("seaside-auth");
      if (stored) {
        const auth = JSON.parse(stored);
        if (auth.accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export default axiosInstance;