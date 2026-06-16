package com.seaside.seaside_api.dto.request;

 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.List;
import java.util.UUID;
 
// ─── Enregistrer un nouveau master ESP32 ────────────────
@Data
public class EnregistrerMasterRequest {
    @NotBlank(message = "L'adresse MAC est obligatoire")
    private String adresseMac;     // "AA:BB:CC:DD:EE:FF"
 
    private String nom;            // "Master Entrée Principale"
 
    @NotNull(message = "L'événement est obligatoire")
    private UUID evenementId;
}