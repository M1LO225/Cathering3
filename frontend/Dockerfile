# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# --- CORRECCIÓN CRÍTICA ---
# Recibimos la URL como argumento de construcción
ARG VITE_API_URL
# La establecemos como variable de entorno para que Vite la lea al hacer build
ENV VITE_API_URL=$VITE_API_URL
# --------------------------

RUN npm run build

# Stage 2: Production (Nginx para servir estáticos)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia una config básica de nginx si la tienes, sino usa la default
# COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]