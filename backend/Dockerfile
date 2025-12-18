# 1. Usar una imagen base de Node ligera (Alpine Linux)
FROM node:22-alpine

# 2. Crear carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar los archivos de dependencias primero (para aprovechar caché)
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código del backend
COPY . .

# 6. Exponer el puerto que usa tu backend
EXPOSE 3000

# 7. Comando para iniciar la app
CMD ["npm", "run", "dev"]