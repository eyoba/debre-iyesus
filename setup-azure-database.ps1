# PowerShell script to setup Azure database from local machine
# Run this AFTER you've configured firewall rules in Azure

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Setup Azure PostgreSQL Database Schema" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Create temporary .env file
$envContent = @"
DATABASE_URL=postgresql://debreiyesus_db_church_user:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
PORT=3010
NODE_ENV=development
"@

Write-Host "Creating temporary .env file..." -ForegroundColor Yellow
$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8

Write-Host "Running database setup..." -ForegroundColor Yellow
Push-Location backend

try {
    node setup-database.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default admin credentials:" -ForegroundColor Cyan
        Write-Host "  Username: superadmin" -ForegroundColor White
        Write-Host "  Password: superadmin123" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Database setup failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  1. Firewall not configured - Add your IP in Azure Portal" -ForegroundColor White
        Write-Host "  2. Database not created - Run Azure CLI commands first" -ForegroundColor White
        Write-Host "  3. Wrong password - Verify in Azure Portal" -ForegroundColor White
        Write-Host ""
    }
} finally {
    Pop-Location

    # Clean up .env file
    Write-Host "Cleaning up temporary .env file..." -ForegroundColor Yellow
    Remove-Item "backend\.env" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "1. Configure backend app in Azure Portal (see BACKEND_ENV_SETTINGS.txt)" -ForegroundColor White
Write-Host "2. Configure frontend app in Azure Portal (see FRONTEND_ENV_SETTINGS.txt)" -ForegroundColor White
Write-Host "3. Get publish profiles from both apps" -ForegroundColor White
Write-Host "4. Add publish profiles to GitHub secrets" -ForegroundColor White
Write-Host "5. Deploy via GitHub Actions" -ForegroundColor White
Write-Host ""
