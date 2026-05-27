package com.seaside.seaside_api.entity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id", nullable = false)
    private Evenement evenement;

    @NotBlank
    @Size(max = 100)
    @Column(name = "categories", nullable = false, length = 100)
    private String nom;  //  // "VIP", "Simple"

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "prix", nullable = false, precision = 12, scale = 2)
    private BigDecimal prix;

    @Min(0)
    @Column(name = "capacite", nullable = false)
    private Integer capacite = 0;

    @Size(max = 20)
    @Column(name = "couleur", length = 20)
    private String couleur;

    @Column(name = "est_actif", nullable = false)
    @Builder.Default
    private Boolean estActif = true;

    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Entree> entrees;

    // Methodes calcules
    public Integer getNombreEntrees() {
        if (entrees == null) return 0;
        return entrees.stream()
                .mapToInt(Entree::getComptage)
                .sum();
    }

    public BigDecimal getRevenuCategorie() {
        return prix.multiply(BigDecimal.valueOf(getNombreEntrees()));
    }

    public Boolean estComplete() {
        return getNombreEntrees() >= capacite;
    }
}
