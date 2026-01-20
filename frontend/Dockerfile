# Etapa 1: Construcción (Build)
# NOTA: Cambié 'as' a 'AS' en mayúsculas para quitar el warning
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Web (Nginx) - Producción
FROM nginx:alpine

# --- AQUÍ ESTÁ EL CAMBIO ---
# Si usas Vite, cambia /app/build por /app/dist
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración necesaria para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]