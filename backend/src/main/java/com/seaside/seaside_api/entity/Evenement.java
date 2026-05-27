package com.seaside.seaside_api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.*;

@Entity
@Table(name = "evenements")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Evenement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)     
    private Utilisateur utilisateur;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nom", length = 100, nullable = false)
    private String nom;

    @NotNull
    @Column(name = "date_evenement", nullable = false)
    private LocalDateTime dateEvenement;

    @Size(max = 50)
    @Column(name = "lieu", length = 50)
    private String lieu;

    @Min(0)
    @Column(name = "capacite_maximale", nullable = false)
    @Builder.Default
    private Integer capaciteMaximale = 0;

    @Column(name = "est_actif", nullable = false)
    @Builder.Default
    private boolean estActif = true;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime   dateCreation;

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Categorie> categories;

    // ------------ Hooks JPA ----------------
    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }

    // ── Méthodes calculées (pas stockées en BDD) ───────────
    public Integer getTotalPersonnes() {
        if ( categories == null) {
            return 0;
        }
        return categories.stream()
                .mapToInt(Categorie::getNombreEntrees)
                .sum();
    }

    public BigDecimal getTotalRevenus() {
        if (categories == null) return BigDecimal.ZERO;
        return categories.stream()
                .map(Categorie::getRevenuCategorie)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public  Boolean estComplet() {
        return getTotalPersonnes() >= capaciteMaximale;
    }

    public void activer() {this.estActif = true; }
    public void desactiver() { this.estActif = false; }
}
