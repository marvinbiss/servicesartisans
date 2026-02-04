@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   IMPORT DE 608 ARTISANS GOOGLE MAPS
echo   (Macons, Peintres, Menuisiers, etc.)
echo ========================================
echo.
npx tsx scripts/import-artisans-data.ts
echo.
pause
