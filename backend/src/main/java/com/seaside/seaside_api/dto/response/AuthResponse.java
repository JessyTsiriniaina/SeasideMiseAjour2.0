package com.seaside.seaside_api.dto.response;

import com.seaside.seaside_api.entity.enums.RoleUsers;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private String type;
    private String email;
    private String nomUtilisateur;
    private RoleUsers role;
}
