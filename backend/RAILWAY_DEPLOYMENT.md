# Railway Deployment Guide for PalTattoo Backend

## Important: Persistent File Storage Setup

Railway's default filesystem is ephemeral, meaning uploaded files will be lost when the service restarts. To persist uploaded images, you MUST configure a Railway Volume.

### Step 1: Create a Railway Volume

1. In your Railway project dashboard, go to your backend service
2. Click on the "Volumes" tab
3. Click "Create Volume"
4. Configure the volume:
   - **Name**: `uploads` (or any name you prefer)
   - **Mount Path**: `/app/data` (this is the default path our code checks)
   - **Size**: Choose based on your needs (e.g., 5GB for start)

### Step 2: Environment Variables

Make sure you have all required environment variables set in Railway:

```env
# Database
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=paltattoo

# JWT Secret
JWT_SECRET=your-secure-jwt-secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# URLs
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.up.railway.app

# Optional: Specify volume mount path (if different from /app/data)
RAILWAY_VOLUME_MOUNT_PATH=/app/data
```

### Step 3: Deploy

1. Push your code to GitHub
2. Railway will automatically deploy
3. Check the logs to ensure directories are created:
   ```
   🗂️  Ensuring upload directories exist...
   ✅ Using upload path: /app/data/uploads
   ✅ Created directory: /app/data/uploads/portfolio
   ```

### Troubleshooting

#### "unable to open for write" Error

If you see this error, it means the volume is not properly mounted or configured:

1. Verify the volume is attached to your service
2. Check that the mount path matches what's in your environment variables
3. Restart the service after attaching the volume

#### Testing Upload Path

The application will automatically test different paths and use the first writable one:
- `$RAILWAY_VOLUME_MOUNT_PATH` (from environment variable)
- `/app/data` (Railway's default volume mount)
- `/data` (alternative mount path)
- `./data` (relative path fallback)

You can check which path is being used in your Railway logs.

### Alternative: External Storage

For production applications, consider using external storage services:
- AWS S3
- Cloudinary
- Google Cloud Storage
- DigitalOcean Spaces

These services are more reliable for file storage than Railway volumes and don't require volume configuration.