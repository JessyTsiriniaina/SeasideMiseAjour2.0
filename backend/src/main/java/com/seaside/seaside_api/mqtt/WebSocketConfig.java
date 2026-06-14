package com.seaside.seaside_api.mqtt;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
 
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
 
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Préfixe des topics vers lesquels Spring pousse les données
        registry.enableSimpleBroker("/topic");
        // Préfixe des messages envoyés par React vers Spring
        registry.setApplicationDestinationPrefixes("/app");
    }
 
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint de connexion WebSocket pour React
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3001")
                .withSockJS(); // fallback pour navigateurs anciens
    }
}
 