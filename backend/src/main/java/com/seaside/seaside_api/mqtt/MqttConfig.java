package com.seaside.seaside_api.mqtt;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Slf4j
@Configuration
public class MqttConfig {

    @Value("${mqtt.broker.url}")
    private String brokerUrl; // tcp://localhost:1883

    @Value("${mqtt.client.id}")
    private String clientId; // seaside-server

    @Value("${mqtt.topic}")
    private String topic; // seaside/entrees/#

    @Value("${mqtt.username:}")
    private String username; // "" si non défini

    @Value("${mqtt.password:}")
    private String password; // "" si non défini

    // ─── Fabrique client MQTT ────────────────────────────────
    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { brokerUrl });

        //  Ajoute l'authentification (pour HiveMQ)
        if (username != null && !username.isEmpty()) {
            options.setUserName(username);
            options.setPassword(password.toCharArray());
            log.info("MQTT authentification activée avec username: {}", username);
        }

        options.setCleanSession(true);
        options.setAutomaticReconnect(true); // reconnexion automatique
        options.setKeepAliveInterval(60);
        // options.setConnectionTimeout(30);
        factory.setConnectionOptions(options);
        return factory;
    }

    // ─── Canal de réception des messages MQTT ───────────────
    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    // ─── Adaptateur ENTRANT: écoute le broker sur le topic ─────────
    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                clientId + "-inbound",
                mqttClientFactory(),
                topic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1); // QoS 1 = au moins une livraison
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }

    // ─── Handler : traite chaque message reçu ───────────────
    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler mqttMessageHandler(MqttRouter mqttRouter) {
        return message -> {
            String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
            String payload = (String) message.getPayload();
            log.info("MQTT reçu — topic: {} | payload: {}", topic, payload);
            mqttRouter.router(topic, payload);
        };
    }

    // Bean sortant : publie vers le broker
    @Bean
    public MqttPahoMessageHandler mqttOutbound() {
        MqttPahoMessageHandler handler = new MqttPahoMessageHandler(
                clientId + "-outbound", // client id unique pour l'outbound
                mqttClientFactory());
        handler.setAsync(true); // non bloquant
        handler.setDefaultQos(1);
        handler.setDefaultRetained(false);
        return handler;
    }

}
