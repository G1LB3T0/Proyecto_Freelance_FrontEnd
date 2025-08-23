# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

# Give permission to the current directory to the node user
RUN mkdir -p /app/node_modules && chown -R node:node /app

USER node
RUN npm install --legacy-peer-deps


# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
