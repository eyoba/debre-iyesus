# Azure New Subscription Setup Guide

## Your New Azure Resources

**Resource Group**: `rg-debre-iyesus`

### Database
- **Server**: debre-iyesus-db.postgres.database.azure.com
- **Admin Username**: debreiyesus_db_church_use
- **Admin Password**: Bergen-db2011
- **Database Name**: debre_iyesus_db (needs to be created)

### Web Apps
- **Backend**: debre-iyesus-api.azurewebsites.net
- **Frontend**: debre-iyesus.azurewebsites.net

### Storage
- **Account**: debreiyesuschurchstorage
- **Container**: church-logo

---

## Step 1: Create PostgreSQL Database

The PostgreSQL server exists, but you need to create the database:

### Option A: Using Azure Portal
1. Go to Azure Portal → `debre-iyesus-db` PostgreSQL server
2. Click **"Databases"** in left menu
3. Click **"+ Add"**
4. Database name: `debre_iyesus_db`
5. Click **"Save"**

### Option B: Using Azure Cloud Shell (Recommended)
```bash
# Open Azure Cloud Shell (bash)
az postgres flexible-server db create \
  --resource-group rg-debre-iyesus \
  --server-name debre-iyesus-db \
  --database-name debre_iyesus_db
```

---

## Step 2: Configure Firewall Rules

Allow your local IP and Azure services to access the database:

### Using Azure Portal:
1. Go to `debre-iyesus-db` PostgreSQL server
2. Click **"Networking"** in left menu
3. Check **"Allow public access from any Azure service within Azure to this server"**
4. Add your current IP address
5. Click **"Save"**

### Using Azure CLI:
```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group rg-debre-iyesus \
  --name debre-iyesus-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your current IP (replace with your actual IP)
az postgres flexible-server firewall-rule create \
  --resource-group rg-debre-iyesus \
  --name debre-iyesus-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_HERE \
  --end-ip-address YOUR_IP_HERE
```

---

## Step 3: Set Up Database Schema

You need to run the database migration scripts to create all tables.

### Local Setup:
1. Update your local `.env` file:
```env
DATABASE_URL=postgresql://debreiyesus_db_church_use:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
```

2. Run the database setup script:
```bash
cd backend
node setup-database.js
```

This will create all tables:
- church_info
- admins
- members
- news
- events
- photos
- sms_logs
- kontingent
- audit_log
- etc.

---

## Step 4: Configure Backend App Service

### Environment Variables (Application Settings):

Go to Azure Portal → `debre-iyesus-api` → Configuration → Application settings

Add these settings:

```
DATABASE_URL=postgresql://debreiyesus_db_church_use:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require

PORT=8080

NODE_ENV=production

FRONTEND_URLS=https://debre-iyesus.azurewebsites.net,https://www.debreiyesus.no,https://debreiyesus.no

JWT_SECRET=your_random_jwt_secret_key_change_this_NOW

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=<GET_FROM_STORAGE_ACCOUNT>
AZURE_STORAGE_CONTAINER_NAME=church-logo

# SMS (Optional - add later if needed)
# AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string
# SMS_COST_PER_MESSAGE=0.16

# Cloudinary (Optional - for additional image hosting)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

### Get Storage Connection String:
1. Go to Storage Account: `debreiyesuschurchstorage`
2. Click "Access keys" in left menu
3. Copy "Connection string" under key1
4. Paste it in `AZURE_STORAGE_CONNECTION_STRING`

### Startup Command:
Go to Configuration → General settings → Startup Command:
```
node server.js
```

---

## Step 5: Configure Frontend App Service

### Environment Variables (Application Settings):

Go to Azure Portal → `debre-iyesus` → Configuration → Application settings

Add:
```
NODE_ENV=production
PORT=8080
VITE_API_URL=https://debre-iyesus-api.azurewebsites.net/api
```

### Startup Command:
Go to Configuration → General settings → Startup Command:
```
node server.js
```

---

## Step 6: Get Publish Profiles for GitHub Actions

### For Backend:
1. Go to Azure Portal → `debre-iyesus-api`
2. Click **"Get publish profile"** in top menu (Download icon)
3. This downloads an XML file
4. Copy the entire contents

### For Frontend:
1. Go to Azure Portal → `debre-iyesus`
2. Click **"Get publish profile"**
3. Copy the entire contents

---

## Step 7: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Add these secrets:

1. **AZURE_BACKEND_PUBLISH_PROFILE**
   - Paste the backend publish profile XML

2. **AZURE_FRONTEND_PUBLISH_PROFILE**
   - Paste the frontend publish profile XML

---

## Step 8: Configure Blob Storage Container

Make sure the `church-logo` container allows public blob access:

### Using Azure Portal:
1. Go to Storage Account: `debreiyesuschurchstorage`
2. Click **"Containers"**
3. Click on **"church-logo"**
4. Click **"Change access level"**
5. Select **"Blob (anonymous read access for blobs only)"**
6. Click **"OK"**

### Using Azure CLI:
```bash
az storage container set-permission \
  --name church-logo \
  --public-access blob \
  --account-name debreiyesuschurchstorage
```

---

## Step 9: Test Deployment

### Manual Trigger:
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Deploy Backend to Azure App Service"
4. Click "Run workflow" → Run workflow
5. Do the same for "Deploy Frontend to Azure App Service"

### Automatic Trigger:
Just push any change to the `main` branch - GitHub Actions will automatically deploy.

---

## Step 10: Verify Deployment

### Check Backend:
```
https://debre-iyesus-api.azurewebsites.net/api/health
```
Should return: `{"status": "OK", "timestamp": "..."}`

### Check Frontend:
```
https://debre-iyesus.azurewebsites.net
```
Should show your church website.

### Check Database Connection:
```
https://debre-iyesus-api.azurewebsites.net/api/church
```
Should return church info or empty object.

---

## Step 11: Custom Domain Setup (Later)

Once everything works, you can add custom domains:

### For Frontend (www.debreiyesus.no):
1. Go to `debre-iyesus` App Service
2. Click "Custom domains"
3. Add: `www.debreiyesus.no` and `debreiyesus.no`
4. Configure DNS records as instructed

---

## Troubleshooting

### Database Connection Issues:
- Check firewall rules
- Verify connection string has `?sslmode=require` at the end
- Test connection locally first

### 502 Bad Gateway:
- Check application logs in Azure Portal
- Verify startup command is correct
- Check if Node.js version matches

### Environment Variables Not Working:
- Restart the App Service after adding settings
- Check spelling and format carefully
- No quotes needed in Azure settings

---

## Important Security Notes

1. **Change JWT_SECRET**: Generate a strong random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Database Password**: The current password `Bergen-db2011` is in this doc. Consider changing it after setup.

3. **Access Keys**: Never commit storage account keys or connection strings to Git.

4. **Firewall**: Limit database access to only necessary IPs once everything works.

---

## Monthly Cost Estimate (Pay-As-You-Go)

- **App Service Plan (Standard S1)**: ~$70/month
- **PostgreSQL Flexible Server (Burstable B1ms)**: ~$12/month (750 hours free for 12 months)
- **Blob Storage**: ~$1/month
- **Total**: ~$71-83/month

With 12-month free credits, expect ~$70/month.

---

## Next Steps

1. ✅ Create database `debre_iyesus_db`
2. ✅ Configure firewall rules
3. ✅ Run database setup script locally
4. ✅ Add environment variables to both App Services
5. ✅ Get publish profiles
6. ✅ Add GitHub secrets
7. ✅ Trigger deployments
8. ✅ Test everything works
9. ✅ Set up custom domain (optional)
10. ✅ Delete old subscription resources

---

## Commands Summary

```bash
# 1. Create database
az postgres flexible-server db create \
  --resource-group rg-debre-iyesus \
  --server-name debre-iyesus-db \
  --database-name debre_iyesus_db

# 2. Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group rg-debre-iyesus \
  --name debre-iyesus-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. Set blob container public access
az storage container set-permission \
  --name church-logo \
  --public-access blob \
  --account-name debreiyesuschurchstorage

# 4. Get storage connection string
az storage account show-connection-string \
  --name debreiyesuschurchstorage \
  --resource-group rg-debre-iyesus \
  --output tsv
```

Need help with any step? Let me know!
