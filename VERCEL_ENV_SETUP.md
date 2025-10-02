# 🚀 Vercel Environment Variables Setup Guide

## Step-by-Step Instructions with Screenshots Guide

### **Step 1: Access Your Vercel Project**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sign in with your account
3. Find your **attendance-system** project
4. Click on the project name

### **Step 2: Navigate to Environment Variables**
1. Click on **"Settings"** tab (top navigation bar)
2. In the left sidebar, click **"Environment Variables"**
3. You should see a page that says "Environment Variables" with an "Add New" button

### **Step 3: Add Each Environment Variable**

Click **"Add New"** and add these variables one by one:

#### **Variable 1: Database Connection**
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_cFngrx8BSbD6@ep-plain-voice-a10rrhv3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variable 2: JWT Secret**
```
Name: JWT_SECRET
Value: 6f65ea9c123ef0c58def53bd27b7de0c
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variable 3: Node Environment**
```
Name: NODE_ENV
Value: production
Environments: ✅ Production only
```

#### **Variable 4: NextAuth Secret**
```
Name: NEXTAUTH_SECRET
Value: 6f65ea9c123ef0c58def53bd27b7de0c
Environments: ✅ Production ✅ Preview ✅ Development
```

### **Step 4: Save and Deploy**

1. After adding all variables, click **"Save"** for each one
2. Go to **"Deployments"** tab
3. Find your latest deployment
4. Click the **three dots (...)** menu
5. Select **"Redeploy"**
6. Wait for the deployment to complete

---

## 🔍 **What Each Variable Does**

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Connects to your Neon PostgreSQL database | ✅ Critical |
| `JWT_SECRET` | Secures user authentication tokens | ✅ Critical |
| `NODE_ENV` | Tells the app it's in production mode | ✅ Important |
| `NEXTAUTH_SECRET` | Secures NextAuth sessions | ✅ Important |

---

## 🛠 **Troubleshooting**

### **If Variables Don't Appear:**
1. Make sure you clicked "Save" after entering each variable
2. Refresh the page to see if they appear
3. Check you're in the correct project

### **If Deployment Still Fails:**
1. Check Vercel function logs in the "Functions" tab
2. Look for specific error messages
3. Ensure all variable names are spelled correctly (case-sensitive)

### **Test Your Deployment:**
After redeployment, test these endpoints:
1. `https://your-app.vercel.app/api/health` - Should return database status
2. `https://your-app.vercel.app/api/auth/login` - Should accept login requests

---

## 🎯 **Expected Results**

After setting up environment variables correctly:

✅ **Health Endpoint Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "userCount": 6,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

✅ **Login Should Work:**
- Email: `admin@company.com`
- Password: `admin123`

---

## 📱 **Quick Reference**

**Your Neon Database URL:**
```
postgresql://neondb_owner:npg_cFngrx8BSbD6@ep-plain-voice-a10rrhv3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Your JWT Secret:**
```
6f65ea9c123ef0c58def53bd27b7de0c
```

**Admin Login:**
```
Email: admin@company.com
Password: admin123
```

---

## 🚀 **Final Steps**

1. ✅ Add all environment variables to Vercel
2. ✅ Redeploy your application  
3. ✅ Test the health endpoint
4. ✅ Try logging in with admin credentials
5. ✅ Your attendance system should be working!

Need help? Check the Vercel function logs for specific error messages.
