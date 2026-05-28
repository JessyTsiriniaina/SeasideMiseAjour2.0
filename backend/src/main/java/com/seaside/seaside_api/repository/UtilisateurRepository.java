package com.seaside.seaside_api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.seaside.seaside_api.entity.Utilisateur;
import java.util.List;


@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID>{

    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNomUtilisateur(String nomUtilisateur);
} 