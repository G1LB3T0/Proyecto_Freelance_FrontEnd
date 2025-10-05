# Configuración de API para Despliegue

Este proyecto usa un sistema de configuración flexible que permite funcionar tanto en desarrollo local como en producción.

##  Configuración

### Desarrollo Local

Para desarrollo local, el archivo `.env` ya está configurado:

```env
VITE_API_URL=http://localhost:3000
```

Esto hará que todas las peticiones vayan a `http://localhost:3000`.

### Producción - Mismo Dominio

Si tu backend y frontend están en el **mismo dominio** (recomendado):

1. En el archivo `.env.production`, deja `VITE_API_URL` vacío:

```env
VITE_API_URL=
```

2. Esto hará que todas las peticiones usen rutas relativas:
   - `/api/posts` en lugar de `http://localhost:3000/api/posts`
   - `/projects` en lugar de `http://localhost:3000/projects`
   - etc.

3. Asegúrate de que tu servidor (nginx, apache, etc.) redirija las peticiones de API al backend.

### Producción - Dominio Diferente

Si tu backend está en un **dominio diferente** al frontend:

1. En el archivo `.env.production`, especifica la URL completa:

```env
VITE_API_URL=https://api.tudominio.com
```

2. Asegúrate de configurar CORS en tu backend para permitir peticiones desde el dominio del frontend.

##  Archivos de Configuración

- **`src/config/api.js`**: Configuración centralizada de la API
- **`.env`**: Variables de entorno para desarrollo
- **`.env.production`**: Variables de entorno para producción

##  Construcción para Producción

```bash
npm run build
```

Esto generará los archivos en la carpeta `dist/` listos para desplegar.

##  Cómo Funciona

El archivo `src/config/api.js` maneja automáticamente la URL de la API:

1. **Prioridad 1**: Variable de entorno `VITE_API_URL`
2. **Prioridad 2**: En producción (`npm run build`), usa rutas relativas si `VITE_API_URL` está vacío
3. **Prioridad 3**: En desarrollo, usa `http://localhost:3000` por defecto

##  Ejemplo de Configuración de Servidor

### Nginx (mismo dominio)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    # Frontend (archivos estáticos)
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Otras rutas del backend
    location ~ ^/(projects|register|login) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache (mismo dominio)

```apache
<VirtualHost *:80>
    ServerName tudominio.com
    DocumentRoot /var/www/frontend/dist

    # Frontend
    <Directory /var/www/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Rewrite para SPA
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Backend API
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
    
    ProxyPass /projects http://localhost:3000/projects
    ProxyPassReverse /projects http://localhost:3000/projects
    
    ProxyPass /register http://localhost:3000/register
    ProxyPassReverse /register http://localhost:3000/register
    
    ProxyPass /login http://localhost:3000/login
    ProxyPassReverse /login http://localhost:3000/login
</VirtualHost>
```

## ✅ Verificación

Para verificar que la configuración es correcta:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Network" (Red)
3. Recarga la página
4. Verifica que las peticiones a la API vayan a la URL correcta

## 🐛 Solución de Problemas

### Error: "No se puede conectar al servidor"

- Verifica que la variable `VITE_API_URL` esté configurada correctamente
- En producción, verifica que el servidor esté redirigiendo las peticiones correctamente
- Revisa los logs del servidor para ver si las peticiones están llegando

### Error de CORS

Si tu backend está en un dominio diferente, necesitas configurar CORS en el backend.

### Las rutas no funcionan después del build

- Asegúrate de que el servidor esté configurado para servir `index.html` en todas las rutas
- Verifica que la configuración de Vite esté correcta en `vite.config.js`

## 📝 Notas Adicionales

- **No commitees** archivos `.env` con datos sensibles
- Usa diferentes archivos `.env` para diferentes entornos
- Las variables de entorno deben empezar con `VITE_` para ser accesibles en el frontend
