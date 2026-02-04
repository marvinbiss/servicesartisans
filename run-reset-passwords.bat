@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   REINITIALISATION MOTS DE PASSE
echo   3 comptes: admin, artisan, client
echo   Mot de passe: Test123!
echo ========================================
echo.
npx tsx scripts/reset-passwords.ts
echo.
pause
