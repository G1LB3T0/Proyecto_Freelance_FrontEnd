@echo off
REM ====================================
REM Script de Build para Producción
REM IP del servidor: 3.15.45.170
REM ====================================

echo.
echo ========================================
echo   BUILD PARA PRODUCCION - Frontend
echo ========================================
echo.
echo Servidor: 3.15.45.170:3000
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "package.json" (
    echo ERROR: No se encuentra package.json
    echo Ejecuta este script desde la carpeta Freelance
    pause
    exit /b 1
)

REM Verificar que existe .env.production
if not exist ".env.production" (
    echo ERROR: No se encuentra .env.production
    echo Crea el archivo .env.production con la configuracion de produccion
    pause
    exit /b 1
)

echo [1/4] Limpiando build anterior...
if exist "dist" (
    rmdir /s /q dist
    echo   - Build anterior eliminado
) else (
    echo   - No hay build anterior
)

echo.
echo [2/4] Verificando configuracion de produccion...
findstr "VITE_API_URL" .env.production
echo.

echo [3/4] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)

echo.
echo [4/4] Construyendo proyecto para produccion...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al construir el proyecto
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Los archivos estan en la carpeta: dist/
echo.
echo Proximos pasos:
echo 1. Copia la carpeta dist/ al servidor 3.15.45.170
echo 2. Configura el servidor web (Nginx/Apache)
echo 3. Verifica en http://3.15.45.170
echo.
echo Ver DEPLOY-SERVIDOR.md para instrucciones detalladas
echo.
pause
