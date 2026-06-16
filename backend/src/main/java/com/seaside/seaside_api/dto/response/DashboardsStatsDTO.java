package com.seaside.seaside_api.dto.response;

 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
 
// ─── Dashboard complet envoyé au frontend ───────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDTO {
    private String evenementId;
    private String nomEvenement;
    private Integer totalPersonnes;
    private BigDecimal totalRevenus;
    private List<CategorieStatDTO> categories;
    private Integer batterieMaster;
    private Boolean masterConnecte;
    private LocalDateTime derniereActiviteMaster;
    private List<SlaveStatusDTO> slaves;
    private List<AlerteDTO> alertes;
}
 