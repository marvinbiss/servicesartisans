@echo off
cd /d "C:\Users\USER\Downloads\servicesartisans"
echo.
echo ========================================
echo   IMPORT GOOGLE MAPS VERS SUPABASE
echo ========================================
echo.
npx tsx scripts/import-google-maps-data.ts
echo.
echo ========================================
echo   IMPORT TERMINE
echo ========================================
echo.
pause
