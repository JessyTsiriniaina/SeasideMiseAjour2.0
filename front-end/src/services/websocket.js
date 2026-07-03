import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

let stompClient = null;

const getWebSocketUrl = () => {
  return "https://seasidemiseajour2-0.onrender.com/api/ws";
};

export const connectWebSocket = (token, onConnect, onError) => {
  if (stompClient?.active) {
    console.log("WebSocket déjà connecté");
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(getWebSocketUrl()),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.log("WebSocket connecté");
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error("STOMP erreur:", frame);
      onError?.(frame);
    },
    onWebSocketError: (error) => {
      console.error("WebSocket erreur:", error);
      onError?.(error);
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient?.active) {
    stompClient.deactivate();
    stompClient = null;
    console.log("WebSocket déconnecté");
  }
};

export const subscribeToTopic = (topic, callback) => {
  if (!stompClient?.active) {
    console.warn("WebSocket non connecté, impossible de s'abonner à", topic);
    return null;
  }

  return stompClient.subscribe(topic, (message) => {
    try {
      const data = JSON.parse(message.body);
      callback(data);
    } catch (error) {
      console.error("Erreur parsing message:", error);
    }
  });
};

export const isWebSocketConnected = () => {
  return stompClient?.active || false;
};

export const getStompClient = () => stompClient;
