@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   ENRICHISSEMENT GPS (1675 artisans)
echo   OpenStreetMap Nominatim API
echo   Duree estimee: 30-60 minutes
echo ========================================
echo.
npx tsx scripts/enrich-gps.ts
echo.
pause
