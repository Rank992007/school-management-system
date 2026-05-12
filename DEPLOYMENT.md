# Deployment Guide: GitHub & Vercel

## Prerequisites
- Git installed and configured
- GitHub account
- Vercel account
- Neon DB database set up

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" button in the top right and select "New repository"
3. Repository name: `school-management-system`
4. Description: `Complete school management system with Neon DB`
5. Choose "Public" or "Private" (Public is free)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands in your project directory:

```bash
# Add the remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git

# Push to GitHub
git push -u origin master
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? `Yes`
   - Which scope? Choose your account
   - Link to existing project? `No`
   - Project name: `school-management-system`
   - Directory: `.` (current directory)
   - Override settings? `No`

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings
5. Click "Deploy"

## Step 4: Configure Environment Variables

In Vercel Dashboard, go to your project settings → Environment Variables and add:

```
DATABASE_URL=your_neon_db_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

## Step 5: Set Up Neon DB

1. Go to [neon.tech](https://neon.tech)
2. Create a new project or use existing one
3. Copy the connection string
4. Add it to Vercel environment variables as `DATABASE_URL`

## Step 6: Initialize Database

After deployment, you'll need to run the database setup:

```bash
# Using Vercel CLI
vercel env pull .env.production
node setup-database.js
```

Or run it directly in the Vercel function logs.

## Step 7: Test Your Application

1. Frontend: `https://your-app.vercel.app`
2. Backend API: `https://your-app.vercel.app/api/auth/me`

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check `DATABASE_URL` environment variable
   - Ensure Neon DB is running
   - Verify SSL settings in connection string

2. **Build Failures**
   - Check `package.json` dependencies
   - Ensure all files are committed to Git
   - Verify `vercel.json` configuration

3. **CORS Issues**
   - Frontend and backend are on same domain with Vercel
   - No CORS configuration needed

4. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

## Deployment URLs

After successful deployment, you'll have:
- **Frontend**: `https://school-management-system-[your-username].vercel.app`
- **Backend API**: Same URL with `/api` prefix

## Monitoring

- Check Vercel dashboard for deployment logs
- Monitor Neon DB dashboard for database performance
- Set up error tracking if needed

## Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned
