# PowerShell script to run database migration
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Database Migration - Add Missing Columns" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Create temporary .env file
$envContent = @"
DATABASE_URL=postgresql://debreiyesus_db_church_user:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
NODE_ENV=development
"@

Write-Host "Creating temporary .env file..." -ForegroundColor Yellow
$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8

Write-Host "Running migration..." -ForegroundColor Yellow
Push-Location backend

try {
    node run-migration.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now update church information from the admin panel." -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host ""
    }
} finally {
    Pop-Location

    # Clean up .env file
    Write-Host "Cleaning up temporary .env file..." -ForegroundColor Yellow
    Remove-Item "backend\.env" -ErrorAction SilentlyContinue
}

Write-Host ""
