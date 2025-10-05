# 🚀 Guía Rápida de Despliegue - Servidor 3.15.45.170

## 📋 Configuración Actual

- **IP del Servidor**: `3.15.45.170`
- **Puerto Backend**: `3000` (ajusta si es diferente)
- **Puerto Frontend**: `3001` o el que configure tu servidor web

## 🔧 Paso 1: Configurar Variables de Entorno

El archivo `.env.production` ya está configurado con la IP correcta:

```env
VITE_API_URL=http://3.15.45.170:3000
```

### Si el backend usa HTTPS:
Edita `.env.production` y cambia a:
```env
VITE_API_URL=https://3.15.45.170:3000
```

### Si el backend usa un puerto diferente:
Por ejemplo, si usa el puerto 5000:
```env
VITE_API_URL=http://3.15.45.170:5000
```

## 🏗️ Paso 2: Construir para Producción

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Construir el proyecto
npm run build
```

Esto creará la carpeta `dist/` con los archivos optimizados.

## 📤 Paso 3: Subir al Servidor

### Opción A: Usando SCP (desde tu máquina local)

```bash
# Navega a la carpeta del proyecto
cd C:\Users\luisy\Desktop\WEB\Proyecto_ING\Proyecto_Freelance_FrontEnd\Freelance

# Copiar archivos al servidor
scp -r dist/* usuario@3.15.45.170:/var/www/html/
```

### Opción B: Usando Git (recomendado)

```bash
# 1. En tu máquina local
git add .
git commit -m "Build para producción"
git push origin Deploy

# 2. En el servidor (SSH)
ssh usuario@3.15.45.170
cd /ruta/del/proyecto
git pull origin Deploy
npm install
npm run build
```

### Opción C: Usando FTP/SFTP

Usa un cliente como FileZilla o WinSCP para copiar la carpeta `dist/` al servidor.

## 🌐 Paso 4: Configurar el Servidor Web

### Si usas Nginx

```bash
# Conéctate al servidor
ssh usuario@3.15.45.170

# Edita la configuración de Nginx
sudo nano /etc/nginx/sites-available/default
```

Configuración recomendada:

```nginx
server {
    listen 80;
    server_name 3.15.45.170;

    # Frontend (archivos estáticos de React)
    location / {
        root /var/www/html/dist;
        try_files $uri /index.html;
        
        # Headers de caché para mejor rendimiento
        add_header Cache-Control "public, max-age=31536000" always;
    }

    # Archivos index sin caché (siempre la última versión)
    location = /index.html {
        root /var/www/html/dist;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

Reiniciar Nginx:
```bash
sudo nginx -t  # Verificar configuración
sudo systemctl restart nginx
```

### Si usas Apache

```bash
# Edita la configuración
sudo nano /etc/apache2/sites-available/000-default.conf
```

```apache
<VirtualHost *:80>
    ServerName 3.15.45.170
    DocumentRoot /var/www/html/dist

    <Directory /var/www/html/dist>
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
</VirtualHost>
```

Reiniciar Apache:
```bash
sudo a2enmod rewrite  # Habilitar mod_rewrite
sudo systemctl restart apache2
```

## ✅ Paso 5: Verificar el Despliegue

1. Abre tu navegador y ve a: `http://3.15.45.170`

2. Abre las DevTools (F12) → pestaña "Network"

3. Verifica que las peticiones a la API vayan a: `http://3.15.45.170:3000`

4. Prueba el login y otras funcionalidades

## 🔐 Configuración HTTPS (Recomendado)

Para usar HTTPS con Let's Encrypt (gratis):

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado (necesitas un dominio, no funciona con IP)
sudo certbot --nginx -d tudominio.com

# Si solo tienes IP, puedes usar un certificado autofirmado:
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

Luego actualiza `.env.production`:
```env
VITE_API_URL=https://3.15.45.170:3000
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar al servidor"

1. Verifica que el backend esté corriendo:
   ```bash
   ssh usuario@3.15.45.170
   curl http://localhost:3000/api/posts
   ```

2. Verifica que el puerto 3000 esté abierto:
   ```bash
   sudo ufw status
   sudo ufw allow 3000
   ```

### Error de CORS

Si ves errores de CORS en la consola del navegador, configura el backend para permitir peticiones desde la IP del frontend.

En tu backend (Node.js/Express):
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://3.15.45.170', 'http://localhost:3001'],
  credentials: true
}));
```

### La página muestra 404 al recargar

Esto indica que falta la configuración de SPA en el servidor web. Revisa el Paso 4.

### Los cambios no se reflejan

1. Limpia la caché del navegador (Ctrl + Shift + Delete)
2. Reconstruye el proyecto: `npm run build`
3. Verifica que subiste los archivos correctos

## 📝 Comandos Útiles

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Ver logs de Apache
sudo tail -f /var/log/apache2/error.log

# Ver procesos del backend
pm2 list  # Si usas PM2
ps aux | grep node  # Procesos Node.js

# Verificar puertos abiertos
sudo netstat -tulpn | grep LISTEN
```

## 🔄 Actualizaciones Futuras

Cuando hagas cambios al proyecto:

```bash
# 1. Desarrollo local
npm run dev  # Probar cambios

# 2. Construir
npm run build

# 3. Subir al servidor (opción Git)
git add .
git commit -m "Descripción de cambios"
git push

# 4. En el servidor
ssh usuario@3.15.45.170
cd /ruta/del/proyecto
git pull
npm run build
# Los archivos en dist/ se actualizarán automáticamente
```

## 📞 Checklist Final

- [ ] `.env.production` tiene la IP correcta (`3.15.45.170`)
- [ ] Backend corriendo en `3.15.45.170:3000`
- [ ] Puerto 3000 abierto en el firewall
- [ ] `npm run build` ejecutado sin errores
- [ ] Archivos `dist/` copiados al servidor
- [ ] Servidor web (Nginx/Apache) configurado
- [ ] Servidor web reiniciado
- [ ] Página carga en `http://3.15.45.170`
- [ ] Las peticiones API funcionan (verificar en DevTools)
- [ ] Login funciona correctamente
- [ ] CORS configurado en el backend

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en `http://3.15.45.170`

Para soporte adicional, revisa `DEPLOYMENT.md` para más detalles.
