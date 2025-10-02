# Vercel Deployment Troubleshooting Guide

## Current Issue
Your login API is returning a 500 Internal Server Error on Vercel deployment. This guide will help you systematically resolve the issue.

## Step 1: Check Environment Variables on Vercel

### Required Environment Variables
Make sure these are set in your Vercel project settings:

```bash
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-minimum-32-characters"
NODE_ENV="production"
```

### How to Set Environment Variables in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the correct values

## Step 2: Database Connection Issues

### Common Database Problems:
1. **DATABASE_URL not set**: Ensure your PostgreSQL connection string is correct
2. **Database not accessible**: Make sure your database allows connections from Vercel's IP ranges
3. **SSL requirements**: Many hosted databases require SSL connections

### Database URL Format:
```
postgresql://username:password@host:port/database?sslmode=require
```

## Step 3: Prisma Client Generation

### Add to your `package.json` scripts:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Vercel Build Settings:
- Build Command: `npm run build`
- Install Command: `npm install`

## Step 4: Test Your Deployment

### 1. Health Check Endpoint
First, test the health endpoint I created:
```
GET https://your-app.vercel.app/api/health
```

This will tell you if:
- Database connection is working
- Prisma client is properly generated
- Environment variables are loaded

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on your API routes to see logs
3. Look for detailed error messages

## Step 5: Common Solutions

### If Database Connection Fails:
1. Verify DATABASE_URL is correct
2. Check if your database provider allows external connections
3. Add `?sslmode=require` to your connection string if needed

### If Prisma Client Issues:
1. Make sure `prisma generate` runs during build
2. Check if `@prisma/client` is in dependencies (not devDependencies)

### If JWT Issues:
1. Ensure JWT_SECRET is set and at least 32 characters
2. Check if bcryptjs is properly installed

## Step 6: Database Seeding on Production

If your database is empty, you need to seed it:

### Option 1: Run seed script locally against production DB
```bash
DATABASE_URL="your-production-db-url" npm run db:seed
```

### Option 2: Create admin user manually
Use a database client to insert the admin user with hashed password.

## Testing Steps

1. **Test Health Endpoint**: `GET /api/health`
2. **Check Function Logs**: Look for specific error messages
3. **Test Login**: `POST /api/auth/login` with admin credentials
4. **Verify Database**: Ensure users exist and are active

## Admin Credentials
```
Email: admin@company.com
Password: admin123
```

## Next Steps After Deployment

1. Test the health endpoint first
2. Check Vercel function logs for specific errors
3. Verify environment variables are set correctly
4. Ensure database is seeded with admin user
5. Test login with improved error logging

The updated login API now provides better error messages and CORS support, which should help identify the specific issue.
