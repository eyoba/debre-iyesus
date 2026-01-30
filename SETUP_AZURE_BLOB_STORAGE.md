# Azure Blob Storage Setup for Unified File Uploads

This guide explains how to set up Azure Blob Storage so that logo uploads from localhost or Azure will be stored in one central location.

## Why Azure Blob Storage?

Previously, when you uploaded a logo from localhost, it was saved to the local filesystem. When you uploaded from Azure, it was saved to Azure's filesystem. This meant different logos on different environments.

With Azure Blob Storage, all uploads go to a single cloud storage location that both localhost and Azure can access.

## Step 1: Create Azure Storage Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Storage account" and click Create
4. Fill in the details:
   - **Resource group**: Use existing `rg-ki-chat-b2c` (or create new)
   - **Storage account name**: Choose a unique name (e.g., `debreiyesusstorage`)
   - **Region**: Same as your app services (recommended)
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally Redundant Storage) is fine for testing
5. Click "Review + Create" then "Create"

## Step 2: Get Connection String

1. Once created, go to your Storage Account
2. In the left menu, under "Security + networking", click "Access keys"
3. Click "Show keys" button
4. Copy the **Connection string** from key1 or key2

## Step 3: Update Environment Variables

### For Local Development (.env file)

Update `backend/.env` file:

```env
# Azure Blob Storage Configuration (for file uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=yourkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=church-logo
```

Replace the connection string with the one you copied from Azure Portal.

### For Azure App Service (debreiyesus-api)

Add environment variables to your backend app service:

```bash
az webapp config appsettings set --name debreiyesus-api --resource-group rg-ki-chat-b2c --settings AZURE_STORAGE_CONNECTION_STRING="your_connection_string_here"

az webapp config appsettings set --name debreiyesus-api --resource-group rg-ki-chat-b2c --settings AZURE_STORAGE_CONTAINER_NAME="church-logo"
```

Or via Azure Portal:
1. Go to your App Service `debreiyesus-api`
2. Click "Configuration" in left menu
3. Click "New application setting"
4. Add:
   - Name: `AZURE_STORAGE_CONNECTION_STRING`
   - Value: Your connection string
5. Add another:
   - Name: `AZURE_STORAGE_CONTAINER_NAME`
   - Value: `church-logo`
6. Click "Save"

## Step 4: Test the Upload

1. **Start local backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Check logs** - you should see:
   ```
   ✅ Azure Blob Storage client initialized
   📦 Container: church-logo
   ```

3. **Upload a logo** from http://localhost:5190/admin/church-info

4. **Verify** - The logo URL should now be:
   ```
   https://yourstorageaccount.blob.core.windows.net/uploads/logo-1234567890.png
   ```

5. **Test on both environments**:
   - Upload from localhost → should work on both localhost and Azure
   - Upload from Azure → should work on both Azure and localhost

## How It Works

The updated code:

1. **Checks if Azure Blob Storage is configured** at startup
2. **When uploading a file**:
   - If Azure is configured → uploads to Azure Blob Storage
   - If not configured → falls back to local storage (for development)
3. **Stores the Azure Blob URL** in the database
4. **Both environments** can access the same file from Azure

## Troubleshooting

### "Azure Blob Storage not configured"

- Check that `AZURE_STORAGE_CONNECTION_STRING` is set in your `.env` file
- Make sure it doesn't contain `your_storage_connection_string_here`
- Restart the backend server after updating `.env`

### "Failed to upload to Azure Blob Storage"

- Verify the connection string is correct
- Check that the storage account exists and is accessible
- Ensure the storage account allows public blob access (or adjust access level)

### Image not displaying

- Make sure the blob container has public read access
- Check browser console for CORS errors
- Verify the URL in the database is the full Azure Blob URL

## Container Access Level

The container is created with `blob` access level, which means:
- ✅ Individual blobs (files) are publicly readable via their URL
- ❌ Container cannot be listed publicly
- This is perfect for serving images on your website

If you need to change access level:
```bash
az storage container set-permission --name church-logo --account-name yourstorageaccount --public-access blob
```

## Security Note

The connection string contains sensitive credentials. NEVER commit it to git or share it publicly. It's already in `.gitignore`.
