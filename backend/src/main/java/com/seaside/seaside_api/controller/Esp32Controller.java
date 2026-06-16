package com.seaside.seaside_api.controller;

import com.seaside.seaside_api.dto.request.AssocierSlaveRequest;
import com.seaside.seaside_api.dto.request.EnregistrerMasterRequest;
import com.seaside.seaside_api.dto.response.DashboardStatsDTO;
import com.seaside.seaside_api.dto.response.SlaveStatusDTO;
import com.seaside.seaside_api.entity.ModuleEsp32;
import com.seaside.seaside_api.entity.Utilisateur;
import com.seaside.seaside_api.service.Esp32Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/esp32")
@RequiredArgsConstructor
public class Esp32Controller {

    private final Esp32Service esp32Service;

    // ─── Utilitaire : récupérer l'id de l'utilisateur connecté
    private UUID moi() {
        return ((Utilisateur) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal()).getId();
    }

    // ════════════════════════════════════════════════════════
    // ENREGISTREMENT & CONFIGURATION
    // ════════════════════════════════════════════════════════

    // POST /esp32/masters
    // Enregistrer un nouveau master ESP32
    @PostMapping("/masters")
    public ResponseEntity<ModuleEsp32> enregistrerMaster(
            @Valid @RequestBody EnregistrerMasterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(esp32Service.enregistrerMaster(req, moi()));
    }

    // POST /esp32/masters/{masterId}/slaves
    // Associer un slave à une catégorie (config dynamique)
    @PostMapping("/masters/{masterId}/slaves")
    public ResponseEntity<SlaveStatusDTO> associerSlave(
            @PathVariable UUID masterId,
            @Valid @RequestBody AssocierSlaveRequest req) {
        return ResponseEntity.ok(esp32Service.associerSlave(masterId, req, moi()));
    }

    // POST /esp32/masters/{masterId}/config/envoyer
    // Renvoyer manuellement la config au firmware
    @PostMapping("/masters/{masterId}/config/envoyer")
    public ResponseEntity<Void> envoyerConfig(@PathVariable UUID masterId) {
        esp32Service.envoyerConfigManuelle(masterId, moi());
        return ResponseEntity.ok().build();
    }

    // ════════════════════════════════════════════════════════
    // LECTURE
    // ════════════════════════════════════════════════════════

    // GET /esp32/evenements/{evenementId}/dashboard
    // Dashboard complet : comptages + télémétrie + slaves
    @GetMapping("/evenements/{evenementId}/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard(
            @PathVariable UUID evenementId) {
        return ResponseEntity.ok(esp32Service.getDashboard(evenementId, moi()));
    }
}