import { createContext, useEffect, useState, useRef, useContext } from "react";
import AuthContext from "./AuthProvider";
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToTopic,
  isWebSocketConnected,
} from "../services/websocket";

const WebSocketContext = createContext({});

export const WebSocketProvider = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef({});

  // Connexion WebSocket au démarrage de l'app et reconnexion si token change
  useEffect(() => {
    if (!auth?.accessToken) {
      // Déconnexion si pas d'authentification
      if (isWebSocketConnected()) {
        disconnectWebSocket();
        setIsConnected(false);
      }
      return;
    }

    // Connexion WebSocket
    connectWebSocket(
      auth.accessToken,
      () => {
        setIsConnected(true);
      },
      (error) => {
        console.error("Erreur WebSocket:", error);
        setIsConnected(false);
      }
    );

    return () => {
      // Cleanup: garder la connexion active jusqu'à logout
    };
  }, [auth?.accessToken]);

  // Fonction pour s'abonner à un topic
  const subscribe = (topic, callback) => {
    if (!isConnected) {
      console.warn("WebSocket non connecté");
      return null;
    }

    const subscription = subscribeToTopic(topic, callback);
    if (subscription) {
      subscriptionsRef.current[topic] = subscription;
    }
    return subscription;
  };

  // Fonction pour se désabonner
  const unsubscribe = (topic) => {
    const subscription = subscriptionsRef.current[topic];
    if (subscription) {
      subscription.unsubscribe();
      delete subscriptionsRef.current[topic];
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
