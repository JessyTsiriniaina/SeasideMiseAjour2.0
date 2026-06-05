package com.seaside.seaside_api.dto.request;

import com.seaside.seaside_api.entity.enums.RoleUsers;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {

    @NotNull(message = "Le role est obligatoire")
    private  RoleUsers role; /// ADMIN OU CLIENT
}