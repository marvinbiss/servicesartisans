# Script PowerShell pour réinitialiser les mots de passe des comptes de test
# Usage: .\scripts\reset-passwords.ps1

# Lire les variables d'environnement depuis .env.local
$envFile = Get-Content ".env.local" -ErrorAction Stop
$envVars = @{}

foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$') {
        $envVars[$matches[1]] = $matches[2]
    }
}

$supabaseUrl = $envVars['NEXT_PUBLIC_SUPABASE_URL']
$serviceKey = $envVars['SUPABASE_SERVICE_ROLE_KEY']

Write-Host "Reinitialisation des mots de passe..." -ForegroundColor Cyan
Write-Host ""

$newPassword = "Test123!"
$accounts = @(
    @{ email = "admin@servicesartisans.fr"; name = "ADMIN" }
    @{ email = "artisan.test@servicesartisans.fr"; name = "ARTISAN" }
    @{ email = "client.test@servicesartisans.fr"; name = "CLIENT" }
)

# Récupérer tous les utilisateurs
$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Recuperation des utilisateurs..." -ForegroundColor Yellow
    $usersResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/admin/users" -Method Get -Headers $headers
    
    foreach ($account in $accounts) {
        Write-Host ""
        Write-Host "Traitement: $($account.name) ($($account.email))" -ForegroundColor Yellow
        
        # Trouver l'utilisateur
        $user = $usersResponse.users | Where-Object { $_.email -eq $account.email } | Select-Object -First 1
        
        if (-not $user) {
            Write-Host "   [!] Compte non trouve" -ForegroundColor Red
            Write-Host "   [i] Executez: npx tsx scripts/create-test-accounts.ts" -ForegroundColor Gray
            continue
        }
        
        # Mettre à jour le mot de passe
        $updateBody = @{
            password = $newPassword
        } | ConvertTo-Json
        
        try {
            $updateUrl = "$supabaseUrl/auth/v1/admin/users/$($user.id)"
            Invoke-RestMethod -Uri $updateUrl -Method Put -Headers $headers -Body $updateBody | Out-Null
            Write-Host "   [OK] Mot de passe reinitialise!" -ForegroundColor Green
        }
        catch {
            Write-Host "   [ERROR] Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "MOTS DE PASSE REINITIALISES" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NOUVEAU MOT DE PASSE POUR TOUS LES COMPTES:" -ForegroundColor Yellow
    Write-Host "   $newPassword" -ForegroundColor White
    Write-Host ""
    Write-Host "COMPTES MIS A JOUR:" -ForegroundColor Yellow
    Write-Host "   1. admin@servicesartisans.fr" -ForegroundColor White
    Write-Host "   2. artisan.test@servicesartisans.fr" -ForegroundColor White
    Write-Host "   3. client.test@servicesartisans.fr" -ForegroundColor White
    Write-Host ""
    Write-Host "URLs DE CONNEXION:" -ForegroundColor Yellow
    Write-Host "   Admin:    https://servicesartisans.fr/admin" -ForegroundColor White
    Write-Host "   Artisan:  https://servicesartisans.fr/espace-artisan" -ForegroundColor White
    Write-Host "   Client:   https://servicesartisans.fr/espace-client" -ForegroundColor White
    Write-Host "   Login:    https://servicesartisans.fr/connexion" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Cyan
}
catch {
    Write-Host "[ERROR] Erreur lors de la recuperation des utilisateurs:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
