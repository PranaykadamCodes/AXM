# 🚀 Setup Guide - Next.js Attendance System

This guide will help you set up the attendance system from scratch.

## 📋 Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL** database (local or cloud)
- **Firebase** project for push notifications
- **Git** for version control

## 🛠 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd attendance-system

# Install dependencies
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb attendance_db

# Create user (optional)
psql -d attendance_db -c "CREATE USER attendance_user WITH PASSWORD 'your_password';"
psql -d attendance_db -c "GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;"
```

#### Option B: Cloud Database (Supabase/Railway/PlanetScale)
1. Create a new PostgreSQL database
2. Copy the connection string

### 3. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your values
nano .env
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db?schema=public"
JWT_SECRET="generate-a-strong-32-character-secret-key"
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
```

### 4. Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Cloud Messaging:**
   - In Firebase Console, go to "Project Settings"
   - Click on "Cloud Messaging" tab
   - Note down your project ID

3. **Generate Service Account Key:**
   - Go to "Project Settings" → "Service Accounts"
   - Click "Generate new private key"
   - Download the JSON file
   - Extract values for `.env`:
     ```json
     {
       "project_id": "your-project-id",
       "private_key": "-----BEGIN PRIVATE KEY-----\n...",
       "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
     }
     ```

### 5. Database Migration and Seeding

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👥 Default Login Credentials

After seeding, you can use these credentials:

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**Employee Accounts:**
- Email: `john.doe@company.com`
- Password: `employee123`
- (More employees available, check seed file)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Utilities
npm run lint            # Run ESLint
```

## 📱 Testing the System

### 1. Admin Flow
1. Login as admin (`admin@company.com` / `admin123`)
2. Navigate to "Manage Users" to see employee list
3. Go to "QR Generator" to create attendance QR codes
4. View analytics on the main dashboard

### 2. Employee Flow
1. Login as employee (`john.doe@company.com` / `employee123`)
2. Go to "Mark Attendance"
3. Try QR scanning (you'll need a QR code from admin)
4. View personal logs and profile

### 3. Registration Flow
1. Go to `/register`
2. Create a new employee account
3. Login as admin to approve the new user
4. Login with the new account

## 🚀 Production Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables for Production:**
   ```env
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="strong-production-secret"
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   NEXTAUTH_SECRET="production-nextauth-secret"
   ```

### Other Platforms

- **Railway:** Connect GitHub repo, add env vars, deploy
- **Render:** Similar process with automatic builds
- **DigitalOcean App Platform:** Deploy from GitHub

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable HTTPS in production
- [ ] Secure Firebase service account key
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting (future enhancement)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error:**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Restart if needed
   brew services restart postgresql
   ```

2. **Prisma Client Error:**
   ```bash
   # Regenerate Prisma client
   npm run db:generate
   ```

3. **Firebase Authentication Error:**
   - Verify Firebase credentials in `.env`
   - Check if private key has proper line breaks (`\n`)

4. **QR Scanner Not Working:**
   - Ensure HTTPS in production (camera requires secure context)
   - Check browser permissions for camera access

5. **NFC Not Working:**
   - NFC only works on Android Chrome
   - Requires HTTPS in production

### Getting Help

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure database is running and accessible
4. Check Firebase project configuration

## 📚 Next Steps

After setup, consider:

1. **Customization:**
   - Update branding and colors
   - Modify attendance rules
   - Add custom fields

2. **Integrations:**
   - Connect to payroll systems
   - Add email notifications
   - Integrate with HR systems

3. **Enhancements:**
   - Mobile app development
   - Advanced analytics
   - Multi-tenant support

## 🤝 Support

For issues and questions:
- Check the main README.md
- Create GitHub issues
- Review the code documentation

---

**Happy coding! 🎉**
