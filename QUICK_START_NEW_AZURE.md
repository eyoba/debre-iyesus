# Quick Start: Deploy to New Azure Subscription

Follow these steps in order to get your site running on the new subscription.

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ Upgraded to Pay-As-You-Go subscription
- ✅ Created resource group: `rg-debre-iyesus`
- ✅ Created PostgreSQL server: `debre-iyesus-db`
- ✅ Created backend app: `debre-iyesus-api`
- ✅ Created frontend app: `debre-iyesus`
- ✅ Created storage account: `debreiyesuschurchstorage`
- ✅ Created blob container: `church-logo`

---

## Step 1: Quick Azure CLI Setup (5 minutes)

Open **Azure Cloud Shell** (Bash) from Azure Portal (icon at top right).

Copy and paste these commands one by one:

```bash
# 1. Create the database
az postgres flexible-server db create \
  --resource-group rg-debre-iyesus \
  --server-name debre-iyesus-db \
  --database-name debre_iyesus_db

# 2. Allow Azure services to access database
az postgres flexible-server firewall-rule create \
  --resource-group rg-debre-iyesus \
  --name debre-iyesus-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. Set blob container to public access
az storage container set-permission \
  --name church-logo \
  --public-access blob \
  --account-name debreiyesuschurchstorage

# 4. Get storage connection string (SAVE THIS!)
az storage account show-connection-string \
  --name debreiyesuschurchstorage \
  --resource-group rg-debre-iyesus \
  --output tsv
```

**Important**: Copy the connection string from step 4 - you'll need it in Step 3!

---

## Step 2: Configure Backend App (3 minutes)

1. Go to Azure Portal → App Services → **debre-iyesus-api**
2. Click **"Configuration"** in left menu
3. Click **"+ New application setting"** for each of these:

### Required Settings:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://debreiyesus_db_church_use:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require` |
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `FRONTEND_URLS` | `https://debre-iyesus.azurewebsites.net` |
| `JWT_SECRET` | Generate one below ⬇️ |
| `AZURE_STORAGE_CONNECTION_STRING` | Paste from Step 1 command 4 |
| `AZURE_STORAGE_CONTAINER_NAME` | `church-logo` |

### Generate JWT Secret:
Run this in PowerShell or Git Bash on your computer:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as `JWT_SECRET`.

4. Click **"Save"** at the top
5. Click **"Continue"** when warned about restart

### Set Startup Command:
1. Still in Configuration, click **"General settings"** tab
2. **Startup Command**: `node server.js`
3. Click **"Save"**

---

## Step 3: Configure Frontend App (2 minutes)

1. Go to Azure Portal → App Services → **debre-iyesus**
2. Click **"Configuration"** → **"+ New application setting"**

### Required Settings:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `VITE_API_URL` | `https://debre-iyesus-api.azurewebsites.net/api` |

3. Click **"Save"** and **"Continue"**

### Set Startup Command:
1. Click **"General settings"** tab
2. **Startup Command**: `node server.js`
3. Click **"Save"**

---

## Step 4: Setup Database Locally (3 minutes)

1. Open your local project in terminal:
```bash
cd c:\churchwebsite\debre-iyesus\backend
```

2. Create a temporary `.env` file:
```bash
# Windows PowerShell:
@"
DATABASE_URL=postgresql://debreiyesus_db_church_use:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
PORT=3010
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding UTF8
```

3. Run the database setup:
```bash
node setup-database.js
```

You should see output like:
```
✅ All tables created successfully
✅ Default admin created
```

4. Delete the `.env` file (don't commit it!):
```bash
rm .env
```

---

## Step 5: Get Publish Profiles (2 minutes)

### Backend Publish Profile:
1. Go to Azure Portal → **debre-iyesus-api**
2. Click **"Get publish profile"** button at the top (download icon)
3. Open the downloaded file in Notepad
4. **Copy the entire contents**

### Frontend Publish Profile:
1. Go to Azure Portal → **debre-iyesus**
2. Click **"Get publish profile"**
3. Open the downloaded file
4. **Copy the entire contents**

---

## Step 6: Add GitHub Secrets (2 minutes)

1. Go to GitHub: https://github.com/eyoba/debre-iyesus
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**

### Add Two Secrets:

**Secret 1:**
- Name: `AZURE_BACKEND_PUBLISH_PROFILE`
- Value: Paste the backend publish profile XML (all of it)
- Click **"Add secret"**

**Secret 2:**
- Name: `AZURE_FRONTEND_PUBLISH_PROFILE`
- Value: Paste the frontend publish profile XML (all of it)
- Click **"Add secret"**

---

## Step 7: Deploy! (5 minutes)

### Option A: Trigger Manual Deployment (Recommended)

1. Go to GitHub → **"Actions"** tab
2. Click **"Deploy Backend to Azure App Service"**
3. Click **"Run workflow"** dropdown → **"Run workflow"**
4. Wait ~3 minutes for deployment
5. Do the same for **"Deploy Frontend to Azure App Service"**

### Option B: Push a Change

Make any small change and push to trigger auto-deployment:
```bash
cd c:\churchwebsite\debre-iyesus
git commit --allow-empty -m "Deploy to new Azure subscription"
git push origin main
```

---

## Step 8: Test Everything Works! (2 minutes)

### Test Backend API:
Open in browser:
```
https://debre-iyesus-api.azurewebsites.net/api/health
```
Should show: `{"status":"OK",...}`

### Test Frontend:
```
https://debre-iyesus.azurewebsites.net
```
Should show your church website!

### Test Database Connection:
```
https://debre-iyesus-api.azurewebsites.net/api/church
```
Should return church info (or empty `{}`)

### Test Admin Login:
1. Go to https://debre-iyesus.azurewebsites.net/admin/login
2. Username: `superadmin`
3. Password: `superadmin123`
4. Should log you in!

---

## Step 9: Custom Domain (Optional - Later)

Once everything works, you can point your domain to the new site:

1. Go to **debre-iyesus** App Service
2. Click **"Custom domains"**
3. Add: `www.debreiyesus.no` and `debreiyesus.no`
4. Follow DNS configuration instructions

---

## Troubleshooting

### "Cannot connect to database"
- Check firewall rules in PostgreSQL
- Verify connection string has `?sslmode=require`
- Make sure database `debre_iyesus_db` was created

### "502 Bad Gateway"
- Check App Service logs: Configuration → App Service logs → Enable
- Verify startup command is set
- Check Application Insights if enabled

### "GitHub Actions failing"
- Verify publish profiles are correct
- Check no extra spaces/characters in secrets
- Make sure you added BOTH secrets

### "Cannot upload logo"
- Verify storage connection string is correct
- Check blob container has public access
- Test storage in Azure Portal → Storage Browser

---

## Summary

Total time: **~25 minutes**

✅ Azure resources configured
✅ Database created and schema setup
✅ Environment variables set
✅ GitHub Actions configured
✅ Deployed and tested

Your site is now running on the new Azure subscription with Standard S1 tier (no more rate limiting issues)!

---

## What's Next?

1. **Test thoroughly** - Add content, upload images, create news
2. **Set up custom domain** - Point www.debreiyesus.no to new site
3. **Delete old subscription** - Once everything works, remove old resources
4. **Monitor costs** - Set up budget alerts in Azure

---

## Need Help?

If you get stuck on any step, let me know and I'll help debug!
