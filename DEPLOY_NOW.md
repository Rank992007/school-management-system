# 🚀 DEPLOY NOW - Complete Instructions

## Your Environment Variables (Ready for Vercel)

Set these as Vercel environment variables (do **not** commit them to the repo):

```
DATABASE_URL=<your-neon-db-connection-string>
JWT_SECRET=<generate-a-strong-random-secret>
NODE_ENV=production
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-password>
```

> **Tip:** Generate a strong JWT secret with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Step-by-Step Vercel Deployment

### 1. Go to Vercel
Visit: https://vercel.com

### 2. Login with GitHub
- Click "Sign up" or "Login"
- Choose "Continue with GitHub"
- Authorize Vercel to access your GitHub repositories

### 3. Create New Project
- Click "New Project" button
- Find and select: `Rank992007/school-management-system`
- Click "Import"

### 4. Configure Project Settings
Vercel will auto-detect most settings. Verify these:

**Framework Preset**: Other
**Root Directory**: . (root)
**Build Command**: `npm install && cd client && npm install && npm run build`
**Output Directory**: `client/build`
**Install Command**: `npm install`

### 5. Add Environment Variables
Click "Environment Variables" and add these five:

1. **DATABASE_URL** — Your Neon DB PostgreSQL connection string
2. **JWT_SECRET** — A strong random secret (use the command above to generate one)
3. **NODE_ENV** — `production`
4. **EMAIL_USER** — Your Gmail address for sending verification emails
5. **EMAIL_PASSWORD** — Your Gmail app password (not your regular password)

### 6. Deploy
- Click "Deploy" button
- Wait for deployment to complete (2-3 minutes)
- You'll see a green checkmark when done

### 7. Your Live App
Your application will be available at your Vercel-assigned URL.

## After Deployment

### Test Your App
1. Visit your Vercel URL
2. Register as a student or teacher
3. Login and test all features

### Set Up Database Schema
If the database tables don't exist, run:
```bash
node setup-database.js
```

### Monitor Deployment
- Check Vercel dashboard for logs
- Monitor Neon DB dashboard for database performance

## Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify build command is correct

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check Neon DB is running
- Ensure SSL settings are correct

### 404 Errors
- Check vercel.json configuration
- Verify routes are correct
- Check build output directory

## Quick Links
- **GitHub**: https://github.com/Rank992007/school-management-system
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon DB**: https://neon.tech

## Success! 🎉
Once deployed, your school management system will be live and accessible from anywhere with automatic HTTPS and SSL certificates.
