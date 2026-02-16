# Troubleshooting Backend 500 Errors

Your backend is deployed and running, but returning 500 errors when trying to fetch data. This means configuration is likely missing or incorrect.

## Quick Fix - Check Backend Environment Variables

### Step 1: Verify All Environment Variables Are Set

Go to: **Azure Portal → debre-iyesus-api → Configuration → Application settings**

**Check that ALL of these exist:**

| Name | Value Should Start With |
|------|------------------------|
| DATABASE_URL | postgresql://debreiyesus_db_church_user:Bergen-db2011@ |
| PORT | 8080 |
| NODE_ENV | production |
| FRONTEND_URLS | https://debre-iyesus.azurewebsites.net, |
| JWT_SECRET | a162f03ac7b69bfedd64e4ff4c2e82dec6727a01... |
| AZURE_STORAGE_CONNECTION_STRING | DefaultEndpointsProtocol=https;AccountName=... |
| AZURE_STORAGE_CONTAINER_NAME | church-logo |

**If ANY are missing, add them using the values from BACKEND_ENV_SETTINGS.txt**

### Step 2: Check Startup Command

Go to: **Configuration → General settings → Startup Command**

Should be: `node server.js`

If it's empty or different, set it to `node server.js` and click Save.

### Step 3: View Backend Logs

Go to: **Azure Portal → debre-iyesus-api → Log stream**

This will show you the exact error. Look for:
- Database connection errors
- Missing environment variable errors
- Module not found errors

Common errors you might see:
```
Error: getaddrinfo ENOTFOUND
→ DATABASE_URL is missing or incorrect

Error: password authentication failed
→ Database password is wrong

Error: Cannot find module 'pg'
→ npm install didn't run (should auto-fix on redeploy)
```

### Step 4: Restart the Backend

After adding missing environment variables:

1. Go to: **Azure Portal → debre-iyesus-api**
2. Click **"Restart"** at the top
3. Wait 1-2 minutes
4. Refresh your website: https://debre-iyesus.azurewebsites.net

### Step 5: Test Backend Directly

Open these URLs in your browser:

1. **Health Check:**
   https://debre-iyesus-api.azurewebsites.net/api/health

   Should return: `{"status":"ok"}`

2. **Church Info:**
   https://debre-iyesus-api.azurewebsites.net/api/church-info

   Should return JSON with church data

If both work, the frontend should start loading data correctly.

---

## Most Likely Issue

Based on the 500 errors, the most common cause is:

**Missing DATABASE_URL environment variable**

Double-check that this environment variable exists in the backend app service configuration with the exact value:

```
postgresql://debreiyesus_db_church_user:Bergen-db2011@debre-iyesus-db.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require
```

---

## If Still Not Working

Share the error from the Log Stream (Step 3 above), and I can help diagnose the specific issue.
