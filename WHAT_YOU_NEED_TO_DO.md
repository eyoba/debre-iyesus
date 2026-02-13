# What You Need To Do - Step by Step

I've created everything I can from here. Follow these steps in order:

---

## ✅ Step 1: Run Azure CLI Commands (5 minutes)

1. Open **Azure Portal**: https://portal.azure.com
2. Click the **Cloud Shell** icon at the top (looks like `>_`)
3. Choose **Bash** if asked
4. Open the file: **SETUP_COMMANDS.txt**
5. Copy and paste commands **one by one**
6. **SAVE the output** from Step 4 (storage connection string)

---

## ✅ Step 2: Configure Backend App (5 minutes)

1. In Azure Portal, go to: **debre-iyesus-api** (App Service)
2. Click **Configuration** in left menu
3. Open the file: **BACKEND_ENV_SETTINGS.txt**
4. Add each setting using **"+ New application setting"**
5. For `AZURE_STORAGE_CONNECTION_STRING`: paste the value you saved from Step 1
6. Click **Save** at the top
7. Go to **General settings** tab
8. Set **Startup Command**: `node server.js`
9. Click **Save**

---

## ✅ Step 3: Configure Frontend App (3 minutes)

1. In Azure Portal, go to: **debre-iyesus** (App Service)
2. Click **Configuration** in left menu
3. Open the file: **FRONTEND_ENV_SETTINGS.txt**
4. Add each setting using **"+ New application setting"**
5. Click **Save** at the top
6. Go to **General settings** tab
7. Set **Startup Command**: `node server.js`
8. Click **Save**

---

## ✅ Step 4: Setup Database Schema (3 minutes)

### Option A: From Your Computer (Recommended)

1. Open **PowerShell** as Administrator
2. Navigate to project:
```powershell
cd c:\churchwebsite\debre-iyesus
```

3. Run the setup script:
```powershell
.\setup-azure-database.ps1
```

If it succeeds, you'll see:
```
✅ Database setup completed successfully!

Default admin credentials:
  Username: superadmin
  Password: superadmin123
```

### Option B: If PowerShell Fails

The firewall might be blocking you. You need to:

1. Get your IP address:
   - Open browser: https://www.whatismyip.com/
   - Copy your IP

2. Add your IP to PostgreSQL firewall:
   - Azure Portal → **debre-iyesus-db** (PostgreSQL)
   - Click **Networking** in left menu
   - Click **"+ Add current client IP address"**
   - Click **Save**

3. Try running `setup-azure-database.ps1` again

---

## ✅ Step 5: Get Publish Profiles (3 minutes)

### Backend Publish Profile:

1. Azure Portal → **debre-iyesus-api**
2. Click **"Get publish profile"** button at top (download icon)
3. File downloads (something like `debre-iyesus-api.PublishSettings`)
4. Open in Notepad
5. **Copy the ENTIRE contents** (Ctrl+A, Ctrl+C)
6. Save for next step

### Frontend Publish Profile:

1. Azure Portal → **debre-iyesus**
2. Click **"Get publish profile"**
3. File downloads
4. Open in Notepad
5. **Copy the ENTIRE contents**
6. Save for next step

---

## ✅ Step 6: Add GitHub Secrets (3 minutes)

1. Go to: https://github.com/eyoba/debre-iyesus
2. Click **"Settings"** tab
3. Click **"Secrets and variables"** → **"Actions"**

### Add Secret #1:
1. Click **"New repository secret"**
2. Name: `AZURE_BACKEND_PUBLISH_PROFILE`
3. Value: **Paste backend publish profile XML** (all of it)
4. Click **"Add secret"**

### Add Secret #2:
1. Click **"New repository secret"**
2. Name: `AZURE_FRONTEND_PUBLISH_PROFILE`
3. Value: **Paste frontend publish profile XML** (all of it)
4. Click **"Add secret"**

---

## ✅ Step 7: Deploy to Azure (5 minutes)

### Trigger Deployment:

1. Go to GitHub: https://github.com/eyoba/debre-iyesus
2. Click **"Actions"** tab
3. Click **"Deploy Backend to Azure App Service"**
4. Click **"Run workflow"** dropdown
5. Click **"Run workflow"** button (green)
6. Wait ~3 minutes
7. Repeat for **"Deploy Frontend to Azure App Service"**

---

## ✅ Step 8: Test Everything (5 minutes)

### Test Backend API:
Open in browser:
```
https://debre-iyesus-api.azurewebsites.net/api/health
```
**Expected**: `{"status":"OK","timestamp":"..."}`

### Test Frontend:
```
https://debre-iyesus.azurewebsites.net
```
**Expected**: Your church website loads!

### Test Admin Login:
1. Go to: https://debre-iyesus.azurewebsites.net/admin/login
2. Username: `superadmin`
3. Password: `superadmin123`
4. **Expected**: You're logged into the admin dashboard!

### Test Database:
```
https://debre-iyesus-api.azurewebsites.net/api/church
```
**Expected**: `{}` or church data if you added some

---

## 🎉 You're Done!

Your site is now running on the new Azure subscription with:
- ✅ Standard S1 tier (no rate limiting!)
- ✅ PostgreSQL database
- ✅ Blob storage for uploads
- ✅ Automatic deployment from GitHub
- ✅ All your features working

---

## 📋 Troubleshooting

### "Database setup failed"
- Add your IP to PostgreSQL firewall (see Step 4, Option B)
- Verify database `debre_iyesus_db` was created in Step 1

### "502 Bad Gateway" on website
- Check App Service logs in Azure Portal
- Verify startup command is `node server.js`
- Check environment variables are set

### "GitHub Actions failing"
- Verify both publish profile secrets are added correctly
- Check there are no extra spaces in the secrets
- Re-download publish profiles if needed

### "Cannot connect to database from Azure"
- Make sure you ran firewall command in Step 1
- The `0.0.0.0` rule allows Azure services

---

## 📱 Next Steps (Optional)

### 1. Custom Domain
Once everything works, add your domain:
- Azure Portal → **debre-iyesus** → **Custom domains**
- Add `www.debreiyesus.no` and `debreiyesus.no`

### 2. Monitor Costs
Set up budget alerts:
- Azure Portal → **Cost Management + Billing**
- Create budget: $100/month with alerts at $50, $75

### 3. Delete Old Subscription
Once confident everything works:
- Delete all resources in old subscription
- Save ~$13/month

---

## 📞 Need Help?

If you get stuck on any step, let me know which step and what error you're seeing!

---

## 📁 Files I Created For You

- ✅ `SETUP_COMMANDS.txt` - Azure CLI commands
- ✅ `BACKEND_ENV_SETTINGS.txt` - Backend configuration
- ✅ `FRONTEND_ENV_SETTINGS.txt` - Frontend configuration
- ✅ `setup-azure-database.ps1` - Database setup script
- ✅ `WHAT_YOU_NEED_TO_DO.md` - This file!
- ✅ `QUICK_START_NEW_AZURE.md` - Detailed guide
- ✅ `AZURE_NEW_SUBSCRIPTION_SETUP.md` - Complete reference

Everything is ready - just follow the steps above! 🚀
