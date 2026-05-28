package com.seaside.seaside_api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "l'email est obligatoire")
    @Email(message = "Format invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est Obligatoire")
    private String motDePasse;

}
