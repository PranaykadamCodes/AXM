#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Attendance System Environment Setup\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  try {
    console.log('This script will help you create your .env file for the attendance system.\n');
    
    // Check if .env already exists
    if (fs.existsSync('.env')) {
      const overwrite = await askQuestion('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('📋 Please provide the following information:\n');

    // Get Neon database URL
    const databaseUrl = await askQuestion('🗄️  Neon Database URL (from Neon dashboard): ');
    
    if (!databaseUrl || !databaseUrl.includes('neon.tech')) {
      console.log('❌ Invalid Neon database URL. Please check your connection string.');
      rl.close();
      return;
    }

    // Get JWT secret
    let jwtSecret = await askQuestion('🔐 JWT Secret (press Enter for auto-generated): ');
    if (!jwtSecret) {
      jwtSecret = require('crypto').randomBytes(32).toString('hex');
      console.log(`   Generated JWT Secret: ${jwtSecret}`);
    }

    // Optional Firebase config
    const useFirebase = await askQuestion('🔥 Do you want to configure Firebase? (y/N): ');
    let firebaseConfig = '';
    
    if (useFirebase.toLowerCase() === 'y' || useFirebase.toLowerCase() === 'yes') {
      const projectId = await askQuestion('   Firebase Project ID: ');
      const privateKey = await askQuestion('   Firebase Private Key (paste the full key): ');
      const clientEmail = await askQuestion('   Firebase Client Email: ');
      
      firebaseConfig = `
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="${projectId}"
FIREBASE_PRIVATE_KEY="${privateKey}"
FIREBASE_CLIENT_EMAIL="${clientEmail}"`;
    } else {
      firebaseConfig = `
# Firebase Admin SDK Configuration (Optional)
# FIREBASE_PROJECT_ID="your-firebase-project-id"
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour Firebase private key here\\n-----END PRIVATE KEY-----"
# FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"`;
    }

    // Create .env content
    const envContent = `# Database Configuration - Neon DB
DATABASE_URL="${databaseUrl}"

# JWT Configuration
JWT_SECRET="${jwtSecret}"
${firebaseConfig}

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${jwtSecret}"

# Environment
NODE_ENV="development"

# Admin Login Credentials
# Email: admin@company.com
# Password: admin123

# Sample Employee Credentials
# Email: john.doe@company.com
# Password: employee123
# Email: jane.smith@company.com
# Password: employee123
`;

    // Write .env file
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Environment file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npm run db:seed');
    console.log('4. Run: npm run dev');
    console.log('\n🎉 Your attendance system is ready to go!');
    
  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
  } finally {
    rl.close();
  }
}

setupEnvironment();
