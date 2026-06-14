package com.seaside.seaside_api.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seaside.seaside_api.entity.Categorie;
import com.seaside.seaside_api.entity.Entree;
import com.seaside.seaside_api.repository.CategorieRepository;
import com.seaside.seaside_api.repository.EntreeRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;
 
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
 
@Slf4j
@Component
@RequiredArgsConstructor
public class MqttSubscriber {
 
    private final CategorieRepository categorieRepository;
    private final EntreeRepository     entreeRepository;
    private final WebSocketPublisher   webSocketPublisher;
    private final ObjectMapper         objectMapper;
 
    // ─── Point d'entrée : appelé par MqttConfig ─────────────
    @Transactional
    public void traiter(String topic, String payload) {
        try {
            // Topic format : seaside/entrees/{categorieId}
            // Ex : seaside/entrees/550e8400-e29b-41d4-a716-446655440000
            String[] parts = topic.split("/");
 
            if (parts.length < 3) {
                log.warn("Topic MQTT invalide : {}", topic);
                return;
            }
 
            UUID categorieId = UUID.fromString(parts[2]);
 
            // Parser le payload JSON envoyé par l'ESP32
            // Format attendu : {"comptage": 1} ou juste "1"
            int comptage = extraireComptage(payload);
 
            // Vérifier que la catégorie existe
            Optional<Categorie> categorieOpt = categorieRepository.findById(categorieId);
            if (categorieOpt.isEmpty()) {
                log.warn("Catégorie introuvable pour id : {}", categorieId);
                return;
            }
 
            Categorie categorie = categorieOpt.get();
            
            //Hibernate.initialize(categorie.getEntrees());

            // Vérifier capacité
            if (categorie.estComplete()) {
                log.warn("Capacité max atteinte pour catégorie : {}", categorie.getNom());
                webSocketPublisher.publierAlerte(
                    categorie.getEvenement().getId().toString(),
                    "Capacité maximale atteinte pour : " + categorie.getNom()
                );
                return;
            }
 
            // Enregistrer l'entrée en base
            Entree entree = Entree.builder()
                    .categorie(categorie)
                    .comptage(comptage)
                    .source("esp32")
                    .build();
            entreeRepository.save(entree);
 
            log.info("Entrée enregistrée — catégorie: {} | comptage: {}",
                    categorie.getNom(), comptage);
 
            // Pousser la mise à jour en temps réel vers React via WebSocket
            webSocketPublisher.publierMiseAJour(
                    categorie.getEvenement().getId().toString(),
                    Map.of(
                        "categorieId",   categorieId.toString(),
                        "nomCategorie",  categorie.getNom(),
                        "comptage",      comptage,
                        "totalCategorie", categorie.getNombreEntrees(),
                        "prixUnitaire", categorie.getPrix()
                    )
            );
 
        } catch (Exception e) {
            log.error("Erreur traitement MQTT — topic: {} | payload: {} | erreur: {}",
                    topic, payload, e.getMessage());
        }
    }
 
    // ─── Extraire le comptage du payload ────────────────────
    private int extraireComptage(String payload) {
        try {
            // Payload JSON : {"comptage": 1}
            Map<?, ?> map = objectMapper.readValue(payload, Map.class);
            Object val = map.get("comptage");
            return val != null ? Integer.parseInt(val.toString()) : 1;
        } catch (Exception e) {
            // Payload simple : "1"
            try { return Integer.parseInt(payload.trim()); }
            catch (Exception ex) { return 1; } // défaut = 1 personne
        }
    }
}
 