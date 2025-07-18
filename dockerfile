# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY Freelance/package*.json ./

# Instalar dependencias con legacy peer deps para resolver conflictos
RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos
COPY Freelance .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos a nginxq