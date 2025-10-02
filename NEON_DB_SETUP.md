# Neon Database Setup Guide

## Step 1: Create Neon Database

### 1.1 Sign up for Neon
1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up with GitHub, Google, or email
3. Neon offers a generous free tier perfect for development

### 1.2 Create a New Project
1. Click "Create Project"
2. Choose a project name (e.g., "attendance-system")
3. Select a region closest to your users
4. Choose PostgreSQL version (latest is recommended)
5. Click "Create Project"

### 1.3 Get Your Connection String
1. After project creation, you'll see the connection details
2. Copy the connection string - it looks like:
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Configure Environment Variables

### 2.1 Create Local Environment File
Create a `.env` file in your project root:

```bash
# Copy from env.example and update with your Neon connection string
cp env.example .env
```

### 2.2 Update .env with Your Neon Connection String
```env
# Database Configuration - Neon DB
DATABASE_URL="postgresql://your-username:your-password@your-neon-endpoint.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters"

# Firebase Admin SDK Configuration (if using)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-for-production"

# Environment
NODE_ENV="development"
```

## Step 3: Database Setup

### 3.1 Generate Prisma Client
```bash
npm run db:generate
```

### 3.2 Push Database Schema
Since Neon is a cloud database, use `db push` instead of migrations for initial setup:
```bash
npx prisma db push
```

### 3.3 Seed the Database
```bash
npm run db:seed
```

## Step 4: Verify Setup

### 4.1 Test Database Connection
```bash
npx prisma studio
```
This will open Prisma Studio where you can view your data.

### 4.2 Test Your Application
```bash
npm run dev
```

### 4.3 Test Health Endpoint
Visit: `http://localhost:3000/api/health`

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "userCount": 6,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Step 5: Production Deployment (Vercel)

### 5.1 Set Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
DATABASE_URL = your-neon-connection-string
JWT_SECRET = your-jwt-secret-32-chars-minimum
NODE_ENV = production
```

### 5.2 Deploy
```bash
git add .
git commit -m "Add Neon database configuration"
git push
```

Vercel will automatically deploy your changes.

## Step 6: Database Management

### 6.1 Neon Dashboard Features
- **Branching**: Create database branches for different environments
- **Monitoring**: View connection stats and query performance
- **Backups**: Automatic backups with point-in-time recovery
- **Scaling**: Automatic scaling based on usage

### 6.2 Useful Commands
```bash
# View database in browser
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate

# Seed database
npm run db:seed
```

## Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Ensure `sslmode=require` is in your connection string
   - Check if your IP is allowlisted (Neon allows all by default)

2. **SSL Certificate Issues**
   - Always use `sslmode=require` with Neon
   - Don't use `sslmode=disable`

3. **Database Not Found**
   - Verify the database name in your connection string
   - Default Neon database is usually named `neondb`

4. **Authentication Failed**
   - Double-check username and password in connection string
   - Regenerate password in Neon dashboard if needed

## Benefits of Neon DB

✅ **Serverless**: Automatically scales to zero when not in use  
✅ **Branching**: Git-like branching for your database  
✅ **Fast**: Built for modern applications  
✅ **Free Tier**: Generous limits for development  
✅ **PostgreSQL**: Full PostgreSQL compatibility  
✅ **Backups**: Automatic backups and point-in-time recovery  

## Next Steps

1. Create your Neon database
2. Update your `.env` file with the connection string
3. Run `npx prisma db push` to create tables
4. Run `npm run db:seed` to add initial data
5. Test with `npm run dev`
6. Deploy to Vercel with environment variables

Your attendance system will now use Neon's powerful serverless PostgreSQL database!
