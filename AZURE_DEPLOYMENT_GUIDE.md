# Azure Deployment Guide for Debre Iyesus Church

This guide will help you deploy the Debre Iyesus Church website to Azure with automated CI/CD pipelines.

## Prerequisites

- Azure subscription
- Azure CLI installed (or use Azure Portal)
- GitHub account with the debre-iyesus repository

## Step 1: Create Azure Web Apps

You need to create TWO Azure Web Apps:
1. **Backend** - Node.js API
2. **Frontend** - Static web app (Vue.js)

### Option A: Using Azure Portal

#### Create Backend App Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → **"Web App"**
3. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing (e.g., `debre-iyesus-rg`)
   - **Name**: `debre-iyesus-backend`
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Norway East (or your preferred region)
   - **Pricing Plan**: Choose your plan (Free F1 for testing, or B1/B2 for production)
4. Click **"Review + Create"** → **"Create"**

#### Create Frontend App Service

1. Click **"Create a resource"** → **"Web App"**
2. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Same as backend
   - **Name**: `debre-iyesus-frontend`
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Same as backend
   - **Pricing Plan**: Same as backend
3. Click **"Review + Create"** → **"Create"**

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name debre-iyesus-rg --location norwayeast

# Create backend app service plan
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

## Step 2: Configure Environment Variables

### Backend Environment Variables

Go to Azure Portal → Your Backend App Service → **Configuration** → **Application settings**

Add these environment variables (use your own secure values):

```
DATABASE_URL = postgresql://username:password@your-server.postgres.database.azure.com:5432/your_database?sslmode=require
PORT = 8080
NODE_ENV = production
JWT_SECRET = your-secure-random-secret-here
FRONTEND_URL = https://debre-iyesus-frontend.azurewebsites.net
BACKEND_URL = https://debre-iyesus-backend.azurewebsites.net
```

Optional (if using SMS features):
```
AZURE_COMMUNICATION_CONNECTION_STRING = your_connection_string_here
AZURE_SMS_SENDER_ID = YourChurchName
SMS_COST_PER_MESSAGE = 0.16
```

**Important**:
- Replace all placeholder values with your actual credentials
- Click **"Save"** after adding the variables!

### Frontend Configuration

The frontend build uses `VITE_API_URL` which is already configured in the GitHub workflow:
```
VITE_API_URL = https://debre-iyesus-backend.azurewebsites.net/api
```

## Step 3: Download Publish Profiles

### For Backend:

1. Go to Azure Portal → **debre-iyesus-backend** App Service
2. Click **"Get publish profile"** button in the Overview page
3. Save the downloaded `.PublishSettings` file
4. Open the file in a text editor and **copy all its contents**

### For Frontend:

1. Go to Azure Portal → **debre-iyesus-frontend** App Service
2. Click **"Get publish profile"** button
3. Save and copy its contents

## Step 4: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/eyoba/debre-iyesus
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these secrets:

### Secret 1: Backend Publish Profile
- **Name**: `AZURE_BACKEND_PUBLISH_PROFILE`
- **Value**: Paste the entire content of the backend publish profile file

### Secret 2: Frontend Publish Profile
- **Name**: `AZURE_FRONTEND_PUBLISH_PROFILE`
- **Value**: Paste the entire content of the frontend publish profile file

## Step 5: Configure Backend Startup

### Set startup command for Backend:

1. Go to Azure Portal → **debre-iyesus-backend**
2. Go to **Configuration** → **General settings**
3. Set **Startup Command**: `node server.js`
4. Click **"Save"**

### Configure CORS:

1. Go to **debre-iyesus-backend** → **CORS**
2. Add allowed origins:
   - `https://debre-iyesus-frontend.azurewebsites.net`
   - `http://localhost:5190` (for local development)
3. Click **"Save"**

## Step 6: Configure Frontend for Static Files

1. Go to Azure Portal → **debre-iyesus-frontend**
2. Go to **Configuration** → **General settings**
3. Set **Startup Command**: `pm2 serve dist 8080 --spa`
4. Click **"Save"**

## Step 7: Test the Deployment

### Manual Deployment Test:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on the workflow you want to run:
   - **Deploy Backend to Azure App Service**
   - **Deploy Frontend to Azure App Service**
4. Click **"Run workflow"** → **"Run workflow"**
5. Wait for the deployment to complete (green checkmark)

### Automatic Deployment:

From now on, whenever you push changes to the `main` branch:
- Changes in `backend/` folder will trigger backend deployment
- Changes in `frontend/` folder will trigger frontend deployment

## Step 8: Verify Deployment

1. **Backend**: Visit https://debre-iyesus-backend.azurewebsites.net/api
   - Should show "Debre Iyesus Church API is running"

2. **Frontend**: Visit https://debre-iyesus-frontend.azurewebsites.net
   - Should show the church homepage

3. **Test Login**:
   - Go to https://debre-iyesus-frontend.azurewebsites.net/admin/login
   - Username: `admin`
   - Password: `admin123` (CHANGE THIS IMMEDIATELY!)

## Monitoring and Logs

### View Backend Logs:
1. Go to Azure Portal → **debre-iyesus-backend**
2. Click **Log stream** to see real-time logs

### View Frontend Logs:
1. Go to Azure Portal → **debre-iyesus-frontend**
2. Click **Log stream**

### Application Insights (Optional):
Enable Application Insights for better monitoring:
1. Go to your App Service → **Application Insights**
2. Click **"Turn on Application Insights"**
3. Configure and create

## Troubleshooting

### Backend not starting:
- Check environment variables are set correctly
- Check the **Log stream** for errors
- Verify the startup command: `node server.js`
- Ensure `DATABASE_URL` is correct

### Frontend showing blank page:
- Check that `VITE_API_URL` in the workflow matches backend URL
- Verify the frontend build completed successfully in GitHub Actions
- Check browser console for errors

### CORS errors:
- Ensure backend CORS is configured to allow frontend URL
- Check that `FRONTEND_URL` environment variable is set in backend

### Database connection issues:
- Verify Azure PostgreSQL firewall rules allow Azure services
- Check `DATABASE_URL` format is correct
- Test connection from backend logs

## Security Best Practices

**IMPORTANT**: Before deploying to production:

1. **Change Default Credentials**
   - Change the default admin password immediately
   - Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Environment Variables**
   - Never commit `.env` files to Git
   - Use Azure Key Vault for storing secrets (recommended)
   - Rotate credentials regularly

3. **Database Security**
   - Use strong database passwords
   - Configure PostgreSQL firewall rules
   - Enable SSL connections
   - Regular backups

4. **Application Security**
   - Enable HTTPS only
   - Configure rate limiting
   - Keep dependencies updated
   - Regular security audits

## Cost Optimization

**Free Tier Option:**
- Use **F1 (Free)** tier for testing
- Note: Free tier has limitations (60 CPU minutes/day, 1GB RAM)

**Production Option:**
- Use **B1 (Basic)** or higher for production
- Estimated cost: ~$13-55/month per app

## Custom Domain (Optional)

To use a custom domain like `www.debreiyesus.no`:

1. Buy domain from a registrar
2. Go to App Service → **Custom domains**
3. Click **"Add custom domain"**
4. Follow the instructions to verify domain ownership
5. Add CNAME or A record in your DNS provider
6. Add SSL certificate (Let's Encrypt free or purchase)

## Support

For issues or questions:
- Check Azure App Service logs
- Review GitHub Actions logs
- Contact Azure support if needed

---

## Quick Reference

**GitHub Actions Workflows:**
- `.github/workflows/deploy-backend.yml`
- `.github/workflows/deploy-frontend.yml`

**Azure Resources:**
- Backend App: `debre-iyesus-backend`
- Frontend App: `debre-iyesus-frontend`
- Resource Group: `debre-iyesus-rg`

**URLs (after deployment):**
- Frontend: `https://debre-iyesus-frontend.azurewebsites.net`
- Backend: `https://debre-iyesus-backend.azurewebsites.net`
