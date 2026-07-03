import { createContext, useState, useCallback, useContext } from 'react';

const NotificationContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setLoadingCount((prev) => Math.max(0, isLoading ? prev + 1 : prev - 1));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, loading: loadingCount > 0, setLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
