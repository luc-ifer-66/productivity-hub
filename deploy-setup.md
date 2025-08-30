# ProductivityHub Deployment to Vercel + Supabase

## Step 1: Set up Supabase Database

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up/login with GitHub
   - Click "New Project"

2. **Create Project**
   - Name: `productivityhub`
   - Generate strong password
   - Select region closest to your users
   - Click "Create new project"

3. **Get Database URL**
   - Go to Settings → Database
   - Copy the "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Run Schema Migration**
   ```bash
   # Set the Supabase DATABASE_URL
   export DATABASE_URL="postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres"
   
   # Push your schema to Supabase
   npm run db:push
   ```

## Step 2: Deploy to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your Replit repository
   - Vercel will auto-detect Vite framework

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL = postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres
   CLERK_SECRET_KEY = sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
   NODE_ENV = production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Step 3: Configure Clerk for Production

1. **Update Clerk Settings**
   - Go to Clerk Dashboard
   - Add your Vercel domain to allowed origins
   - Update redirect URLs to your Vercel domain

## Step 4: Test Deployment

1. **Verify PWA Features**
   - Check manifest.webmanifest loads correctly
   - Test service worker registration
   - Verify offline functionality

2. **Test Authentication**
   - Sign up/sign in works
   - User data syncs correctly
   - API endpoints respond properly

## Your Deployment URLs

- **Frontend**: https://[your-project].vercel.app
- **API**: https://[your-project].vercel.app/api/*
- **Database**: Supabase Dashboard

## Files Created/Modified

- `vercel.json` - Vercel deployment configuration
- `api/index.ts` - Serverless function entry point
- `.env.example` - Environment variables template

Your ProductivityHub PWA is now ready for production deployment!