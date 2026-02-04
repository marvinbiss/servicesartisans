@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   ENRICHISSEMENT SIRET (2090 artisans)
echo   API SIRENE - INSEE
echo   Duree estimee: 20-30 minutes
echo ========================================
echo.
npx tsx scripts/enrich-siret.ts
echo.
pause
