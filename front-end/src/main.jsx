/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthProvider.jsx";
import { WebSocketProvider } from "./context/WebSocketProvider.jsx";
import { NotificationProvider, useNotification } from "./context/NotificationContext.jsx";
import Toast from "./components/Toast.jsx";
import { setAxiosCallbacks } from "./api/axios";

const AxiosInterceptorBridge = () => {
  const { setLoading, showNotification } = useNotification();

  useEffect(() => {
    setAxiosCallbacks(setLoading, showNotification);
  }, [setLoading, showNotification]);

  return null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AxiosInterceptorBridge />
      <AuthProvider>
        <WebSocketProvider>
          <App />
          <Toast />
        </WebSocketProvider>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
)
