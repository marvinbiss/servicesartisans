@echo off
echo ========================================
echo  IMPORT GPS PARFAIT - Google Maps
echo ========================================
echo.
echo Verification de .env.local...
if not exist ".env.local" (
    echo ERREUR: Fichier .env.local introuvable!
    pause
    exit /b 1
)

echo.
echo Demarrage de l'import GPS...
echo.
npx ts-node scripts/import-gps-perfect.ts

echo.
echo ========================================
echo  Import termine!
echo ========================================
pause
