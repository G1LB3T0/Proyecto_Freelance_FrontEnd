# 🚀 DEPLOYMENT RÁPIDO - Servidor 3.15.45.170

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Construir para Producción

**Opción A - Usando el script automático (Windows):**
```bash
# Doble clic en:
build-production.bat
```

**Opción B - Manual:**
```bash
npm install
npm run build
```

### 2️⃣ Subir al Servidor

Copia la carpeta `dist/` al servidor `3.15.45.170`:

```bash
# Usando SCP (reemplaza 'usuario' con tu usuario SSH)
scp -r dist/* usuario@3.15.45.170:/var/www/html/
```

### 3️⃣ ¡Listo! 

Abre: `http://3.15.45.170`

---

## 📁 Archivos de Configuración

| Archivo | Propósito | IP Configurada |
|---------|-----------|----------------|
| `.env` | Desarrollo local | `localhost:3000` |
| `.env.production` | **Producción** | **`3.15.45.170:3000`** |
| `.env.example` | Ejemplo/Plantilla | Varios ejemplos |

## 🔧 Configuración Actual

```env
# .env.production
VITE_API_URL=http://3.15.45.170:3000
```

### ¿Necesitas cambiar el puerto del backend?

Edita `.env.production`:
```env
VITE_API_URL=http://3.15.45.170:5000  # Para puerto 5000
```

### ¿Tu servidor usa HTTPS?

Edita `.env.production`:
```env
VITE_API_URL=https://3.15.45.170:3000
```

## 📖 Documentación Completa

- **`DEPLOY-SERVIDOR.md`** - Guía completa paso a paso para tu servidor
- **`DEPLOYMENT.md`** - Guía general de deployment
- **`CAMBIOS.md`** - Resumen de cambios técnicos

## ✅ Checklist Pre-Deploy

- [ ] Backend corriendo en `3.15.45.170:3000`
- [ ] Puerto 3000 abierto en firewall del servidor
- [ ] `.env.production` tiene la IP correcta
- [ ] `npm run build` ejecutado sin errores
- [ ] Archivos `dist/` listos para copiar

## 🐛 Problemas Comunes

### "No se puede conectar al servidor"
- ✅ Verifica que el backend esté corriendo
- ✅ Verifica que el puerto 3000 esté abierto
- ✅ Revisa la consola del navegador (F12)

### Error de CORS
Configura CORS en el backend:
```javascript
app.use(cors({
  origin: ['http://3.15.45.170'],
  credentials: true
}));
```

### Página 404 al recargar
Configura tu servidor web para SPA. Ver `DEPLOY-SERVIDOR.md` paso 4.

## 🔄 Actualizar el Proyecto

```bash
# 1. Haz cambios en el código
# 2. Prueba localmente
npm run dev

# 3. Construye para producción
npm run build

# 4. Sube al servidor
scp -r dist/* usuario@3.15.45.170:/var/www/html/
```

## 💡 Tips

- **Desarrollo Local**: Usa `npm run dev` (conecta a `localhost:3000`)
- **Probar contra servidor**: Cambia `.env` temporalmente a `http://3.15.45.170:3000`
- **Cache del navegador**: Usa Ctrl+Shift+R para recargar sin cache
- **Logs**: Revisa DevTools → Network para ver peticiones

## 📞 Necesitas Ayuda?

1. Lee `DEPLOY-SERVIDOR.md` - Guía completa con todos los detalles
2. Verifica la configuración del servidor web (Nginx/Apache)
3. Revisa los logs del backend y frontend
4. Usa las DevTools del navegador (F12) para debugging

---

## 🎯 Resumen de URLs

| Entorno | Frontend | Backend |
|---------|----------|---------|
| **Desarrollo** | `http://localhost:3001` | `http://localhost:3000` |
| **Producción** | `http://3.15.45.170` | `http://3.15.45.170:3000` |

---

**¡Tu proyecto está listo para producción!** 🎉
