package com.seaside.seaside_api.dto.request;

 
import jakarta.validation.constraints.NotNull;
import lombok.Data;
 
import java.util.UUID;
 
// ─── Associer un slave à une catégorie (dynamique) ──────
// C'est ici que l'admin dit : "Slave 1 = Porte VIP = Catégorie VIP"
@Data
public class AssocierSlaveRequest {
 
    @NotNull(message = "Le numéro du slave est obligatoire")
    private Integer slaveId;       // numéro physique du slave (1, 2, 3...)
 
    private String nom;            // "Slave Porte VIP"
 
    // La catégorie à laquelle ce slave est associé
    // null = slave non encore configuré
    private UUID categorieId;
}