# Azure Deployment Troubleshooting Guide

## Current Error

You're seeing this error in GitHub Actions:
```
Error: Publish profile is invalid for app-name and slot-name provided
```

This means either:
1. The Azure Web Apps don't exist yet, OR
2. The Azure Web App names don't match what's in the workflow files, OR
3. The publish profile secrets in GitHub are incorrect

## Quick Fix Steps

### Step 1: Check if Azure Web Apps Exist

Run this command to see if the apps exist:

```bash
az webapp list --output table
```

Look for these specific app names:
- `debre-iyesus-backend`
- `debre-iyesus-frontend`

### Step 2A: If Apps DON'T Exist - Create Them

If the apps don't exist, create them now:

```bash
# Login to Azure
az login

# Create resource group (if it doesn't exist)
az group create --name debre-iyesus-rg --location norwayeast

# Create app service plan
az appservice plan create \
  --name debre-iyesus-plan \
  --resource-group debre-iyesus-rg \
  --location norwayeast \
  --sku B1 \
  --is-linux

# Create backend web app
az webapp create \
  --name debre-iyesus-backend \
  --resource-group debre-iyesus-rg \
  --plan debre-iyesus-plan \
  --runtime "NODE:18-lts"

# Create frontend web app
az webapp create \
  --name debre-iyesus-frontend \
  --resource-group debre-iyesus-rg \
  --plan debre-iyesus-plan \
  --runtime "NODE:18-lts"
```

### Step 2B: If Apps Exist with DIFFERENT Names - Update Workflows

If you already created apps with different names, you need to update the workflow files.

**For example, if your apps are named:**
- `my-church-backend-app`
- `my-church-frontend-app`

Update these files:

1. Edit [.github/workflows/deploy-backend.yml](.github/workflows/deploy-backend.yml) line 13:
```yaml
AZURE_WEBAPP_NAME: my-church-backend-app  # Change to YOUR actual app name
```

2. Edit [.github/workflows/deploy-frontend.yml](.github/workflows/deploy-frontend.yml) line 13:
```yaml
AZURE_WEBAPP_NAME: my-church-frontend-app  # Change to YOUR actual app name
```

### Step 3: Download Publish Profiles

After the apps are created (or if they already exist), download the publish profiles:

#### Using Azure Portal:
1. Go to https://portal.azure.com
2. Find your backend app (debre-iyesus-backend or whatever name you used)
3. Click **"Get publish profile"** button at the top
4. Save the downloaded file
5. Open it in Notepad and **copy ALL the content**
6. Repeat for frontend app

#### Using Azure CLI:
```bash
# Download backend publish profile
az webapp deployment list-publishing-profiles \
  --name debre-iyesus-backend \
  --resource-group debre-iyesus-rg \
  --xml

# Download frontend publish profile
az webapp deployment list-publishing-profiles \
  --name debre-iyesus-frontend \
  --resource-group debre-iyesus-rg \
  --xml
```

### Step 4: Update GitHub Secrets

1. Go to: https://github.com/eyoba/debre-iyesus/settings/secrets/actions
2. Check if these secrets exist:
   - `AZURE_BACKEND_PUBLISH_PROFILE`
   - `AZURE_FRONTEND_PUBLISH_PROFILE`

3. If they DON'T exist, click **"New repository secret"** and add them
4. If they DO exist but are wrong, click on each one → **"Update"** → paste the correct content

**CRITICAL**: Make sure you paste the ENTIRE content of the publish profile XML file, from `<?xml version...` to the closing tag.

### Step 5: Configure Backend Startup

```bash
# Set startup command for backend
az webapp config set \
  --name debre-iyesus-backend \
  --resource-group debre-iyesus-rg \
  --startup-file "node server.js"

# Set startup command for frontend (to serve the built static files)
az webapp config set \
  --name debre-iyesus-frontend \
  --resource-group debre-iyesus-rg \
  --startup-file "npx serve dist -s -l 8080"
```

### Step 6: Add Environment Variables to Backend

```bash
# Set required environment variables for backend
az webapp config appsettings set \
  --name debre-iyesus-backend \
  --resource-group debre-iyesus-rg \
  --settings \
    PORT=8080 \
    NODE_ENV=production \
    JWT_SECRET="your-new-secure-secret-here" \
    FRONTEND_URL="https://debre-iyesus-frontend.azurewebsites.net" \
    BACKEND_URL="https://debre-iyesus-backend.azurewebsites.net" \
    DATABASE_URL="your-postgresql-connection-string"
```

**IMPORTANT**: Replace the placeholder values with your actual values, especially:
- `JWT_SECRET`: Generate a new one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `DATABASE_URL`: Your NEW PostgreSQL connection string (after changing the password that was exposed)

### Step 7: Configure CORS

```bash
# Allow frontend to access backend
az webapp cors add \
  --name debre-iyesus-backend \
  --resource-group debre-iyesus-rg \
  --allowed-origins "https://debre-iyesus-frontend.azurewebsites.net" "http://localhost:5190"
```

### Step 8: Test Deployment

1. Go to: https://github.com/eyoba/debre-iyesus/actions
2. Click on the failed workflow
3. Click **"Re-run all jobs"** → **"Re-run jobs"**

OR trigger a new deployment by making a small change and pushing to main:

```bash
# Make a small change to trigger deployment
echo "# Deployment Test" >> README.md
git add README.md
git commit -m "Test deployment"
git push origin main
```

## Quick Checklist

- [ ] Azure Web Apps exist with correct names (or workflow files updated to match)
- [ ] Publish profiles downloaded from Azure
- [ ] GitHub secrets correctly set with full publish profile content
- [ ] Backend environment variables configured
- [ ] CORS configured on backend
- [ ] Startup commands set for both apps
- [ ] Database password changed (since it was exposed)

## Still Having Issues?

If you still get errors, share:
1. The output of `az webapp list --output table`
2. Your Azure Web App names
3. Screenshot of GitHub Actions error
