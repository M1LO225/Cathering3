# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./

# --- CORRECCIÓN CRÍTICA AQUÍ ---
# 1. Creamos la carpeta uploads explícitamente
# 2. Le damos permisos al usuario 'node' sobre TODA la carpeta /app
RUN mkdir -p uploads && chown -R node:node /app
# -------------------------------

# Usuario no-root por seguridad
USER node

EXPOSE 3002
CMD ["node", "index.js"]