# PowerShell script to rename member_number to card_number
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Database Migration - Rename member_number to card_number" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Create temporary .env file
$envContent = @"
DATABASE_URL=postgresql://debreiyesus_db_church_user:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
NODE_ENV=development
"@

Write-Host "Creating temporary .env file..." -ForegroundColor Yellow
$envContent | Out-File -FilePath "c:\churchwebsite\debre-iyesus\backend\.env" -Encoding UTF8

Write-Host "Running migration..." -ForegroundColor Yellow
Push-Location "c:\churchwebsite\debre-iyesus\backend"

try {
    # Run the migration SQL directly
    node -e "const {Pool}=require('pg');const fs=require('fs');require('dotenv').config();const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:false});(async()=>{try{const sql=fs.readFileSync('rename-member-number.sql','utf8');await pool.query(sql);console.log('✅ Column renamed from member_number to card_number');await pool.end();}catch(e){console.error('❌ Error:',e.message);process.exit(1);}})();"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Column renamed: member_number → card_number" -ForegroundColor Cyan
        Write-Host "Medlemskortnummer (EROTCHDEID) field will now work correctly!" -ForegroundColor Cyan
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
    Remove-Item "c:\churchwebsite\debre-iyesus\backend\.env" -ErrorAction SilentlyContinue
}

Write-Host ""
