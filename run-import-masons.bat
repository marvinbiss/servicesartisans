@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   IMPORT DES 608 MACONS GOOGLE MAPS
echo ========================================
echo.
npx tsx scripts/import-masons-data.ts
echo.
pause
