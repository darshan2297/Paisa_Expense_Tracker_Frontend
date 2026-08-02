# syntax=docker/dockerfile:1

# ---- Build stage --------------------------------------------------------
# Exports the app as static web assets (HTML/JS/CSS) into ./dist.
# Native (iOS/Android) builds are handled separately via EAS Build, not here.
FROM node:22-alpine AS build

WORKDIR /app

# Install deps first so this layer is cached unless package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# EXPO_PUBLIC_* vars are inlined into the JS bundle at export time, so the
# API URL for this deployed environment must be supplied as a build arg.
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

RUN npx expo export --platform web

# ---- Runtime stage -------------------------------------------------------
# Minimal static file server for the exported bundle. `serve` handles SPA
# fallback routing (client-side navigation) out of the box with -s.
FROM node:22-alpine AS runtime

WORKDIR /app
RUN npm install --global serve@14

COPY --from=build /app/dist ./dist

EXPOSE 3000

# -s enables single-page-app fallback so client-side routes (e.g. deep links
# into (tabs)/(auth) groups) resolve to index.html instead of 404ing.
CMD ["serve", "-s", "dist", "-l", "3000"]
