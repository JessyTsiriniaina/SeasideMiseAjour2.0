import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://seasidemiseajour2-0.onrender.com/api",
});

let setLoadingCallback = () => {};
let showNotificationCallback = () => {};

export const setAxiosCallbacks = (setLoading, showNotification) => {
  setLoadingCallback = setLoading;
  showNotificationCallback = showNotification;
};

axiosInstance.interceptors.request.use((config) => {
  setLoadingCallback(true);
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
}, (error) => {
  setLoadingCallback(false);
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => {
    setLoadingCallback(false);

    const method = response.config.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      showNotificationCallback("Opération réussie", "success");
    }

    return response;
  },
  (error) => {
    setLoadingCallback(false);

    let message = "Une erreur est survenue";
    if (error.response) {
      message = error.response.data?.message || error.response.data?.error || `Erreur: ${error.response.status}`;
    } else if (error.request) {
      message = "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }

    showNotificationCallback(message, "error");

    return Promise.reject(error);
  }
);

export default axiosInstance;
