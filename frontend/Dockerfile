# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# --- CORRECCIÓN: Copiar nuestra config personalizada ---
COPY nginx.conf /etc/nginx/conf.d/default.conf
# -----------------------------------------------------

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]