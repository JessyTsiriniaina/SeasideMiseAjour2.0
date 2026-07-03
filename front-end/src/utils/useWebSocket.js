import { useContext, useEffect, useState } from "react";
import WebSocketContext from "../context/WebSocketProvider";

/**
 * Hook pour s'abonner à un topic WebSocket
 * @param {string} topic - Le topic à écouter (ex: /topic/comptage/{evenementId})
 * @param {function} callback - Fonction appelée quand un message arrive
 * @returns {boolean} - true si connecté et abonné
 *
 * Exemple:
 * const isSubscribed = useSubscribeToTopic(`/topic/comptage/${eventId}`, (data) => {
 *   console.log("Nouveau comptage:", data);
 * });
 */
export const useSubscribeToTopic = (topic, callback) => {
  const { isConnected, subscribe, unsubscribe } = useContext(WebSocketContext);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isConnected || !topic || !callback) {
      return;
    }

    const subscription = subscribe(topic, callback);
    if (subscription) {
      setIsSubscribed(true);
    }

    return () => {
      unsubscribe(topic);
      setIsSubscribed(false);
    };
  }, [isConnected, topic, callback, subscribe, unsubscribe]);

  return isSubscribed;
};

/**
 * Hook pour vérifier la connexion WebSocket
 * @returns {boolean} - true si connecté
 */
export const useWebSocketStatus = () => {
  const { isConnected } = useContext(WebSocketContext);
  return isConnected;
};
