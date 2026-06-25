# ════════════════════════════════════════════════════════════
# SEASIDE 2.0 — Dockerfile pour déploiement Render
# Multi-stage build : étape build séparée de l'étape runtime
# Image finale beaucoup plus légère (pas de Maven dans l'image finale)
# ════════════════════════════════════════════════════════════

# ─── STAGE 1 : BUILD ──────────────────────────────────────
# Utilise une image Maven officielle avec JDK 21 préinstallé
# Plus rapide que d'installer Maven manuellement comme dans
# l'ancienne version (apt-get install maven à chaque build)
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier uniquement le pom.xml d'abord
# Permet à Docker de mettre en cache les dépendances Maven
# tant que pom.xml ne change pas (build beaucoup plus rapide)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le code source seulement après
COPY src ./src

# Builder le jar (skip les tests pour un déploiement plus rapide)
RUN mvn clean package -DskipTests -B

# ─── STAGE 2 : RUNTIME ────────────────────────────────────
# Image finale légère — JRE seulement, pas le JDK complet
# ni Maven (qui ne sont plus nécessaires pour faire tourner le jar)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copier uniquement le jar depuis le stage de build
COPY --from=build /app/target/*.jar app.jar

# Render injecte automatiquement la variable PORT
# L'application doit écouter sur ce port (voir application-prod.properties)
EXPOSE 8080

# ─── Profil actif en production ──────────────────────────
# Peut aussi être surchargé par la variable d'env Render
# SPRING_PROFILES_ACTIVE=prod
ENV SPRING_PROFILES_ACTIVE=prod

# Lancement avec le profil prod actif
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]