# USAMOS DEBIAN (SLIM) EN LUGAR DE ALPINE
# Esto evita problemas de compatibilidad con Python y SQLite
FROM node:20-slim

# Instalar OpenSSL (Necesario para Sequelize/Auth) y herramientas básicas
RUN apt-get update -y && apt-get install -y openssl python3 make g++

WORKDIR /app

COPY package*.json ./

# CAMBIO CRÍTICO:
# Quitamos "--build-from-source".
# Al usar Debian, npm descargará el binario de SQLite ya compilado.
RUN npm install

COPY . .

# Crear carpeta de datos
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "run", "dev"]