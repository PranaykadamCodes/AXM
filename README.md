# Next.js Attendance System — Extended with Employee Accounts & Dashboards

A comprehensive **QR + NFC/RFID Attendance System** built with **Next.js 15 (App Router)**, **Tailwind CSS**, **Prisma (PostgreSQL)**, and **Firebase Admin (FCM)**. Features employee account management, role-based dashboards, attendance logging, push notifications, and analytics with report exports.

## 🚀 Features

### Authentication & User Management
- **JWT-based authentication** with secure token handling
- **Two roles**: `admin` and `employee`
- **Employee Onboarding**:
  - Self-registration with admin approval
  - Admin can add employees directly
- **Role-based dashboards** for different user types

### Attendance Tracking
- **QR Code Scanning**: Dynamic QR codes with HMAC/JWT signing and expiry
- **NFC/RFID Support**: Web NFC API for contactless attendance
- **Geolocation**: Optional location tracking for attendance records
- **Session Management**: Automatic IN/OUT pairing with session IDs

### Admin Dashboard
- **Real-time Analytics**: Daily, weekly, monthly attendance trends
- **Employee Management**: Add, edit, approve, and deactivate users
- **QR Code Generator**: Create time-limited QR codes for attendance
- **Report Export**: Generate Excel and PDF reports
- **Department Statistics**: Track attendance by department and method

### Employee Dashboard
- **Personal Attendance Logs**: View own check-in/out history
- **Profile Management**: Update personal information
- **Monthly Reports**: Download personal attendance reports
- **Real-time Stats**: Today's working hours and attendance count

### Notifications & Reports
- **Push Notifications**: Firebase FCM integration for attendance confirmations
- **Excel Export**: Detailed attendance reports with ExcelJS
- **PDF Generation**: Professional reports with charts and summaries
- **Email Notifications**: (Ready for integration)

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Push Notifications**: Firebase Admin SDK (FCM)
- **Reports**: ExcelJS for Excel, PDFKit for PDF
- **QR Codes**: qrcode.react, react-qr-reader
- **NFC**: Web NFC API (Android Chrome)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Firebase project (for push notifications)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd attendance-system
npm install
```

### 2. Environment Setup

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db?schema=public"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging (FCM)
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
4. Extract the required values for your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Usage Guide

### For Administrators

1. **Initial Setup**:
   - Register as the first user (will need manual database update to set role as 'admin')
   - Or create admin user via API or database directly

2. **Employee Management**:
   - Navigate to `/dashboard/admin/users`
   - Approve pending employee registrations
   - Add new employees manually
   - Manage user roles and status

3. **QR Code Generation**:
   - Go to `/dashboard/admin/qr`
   - Generate time-limited QR codes
   - Display QR codes for employees to scan

4. **Analytics & Reports**:
   - View real-time analytics on admin dashboard
   - Export attendance reports in Excel format
   - Monitor department-wise attendance

### For Employees

1. **Registration**:
   - Visit `/register` to create account
   - Wait for admin approval
   - Login at `/login` once approved

2. **Mark Attendance**:
   - Go to `/dashboard/emp/scan`
   - Choose QR or NFC method
   - Select IN or OUT
   - Scan QR code or tap NFC device

3. **View Records**:
   - Check personal dashboard for today's stats
   - View detailed logs at `/dashboard/emp/logs`
   - Export personal reports

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Employee registration
- `POST /api/auth/login` - User login
- `POST /api/auth/approve` - Admin approve user

### Attendance
- `POST /api/attendance/scan` - QR code attendance
- `POST /api/attendance/nfc` - NFC/RFID attendance
- `GET /api/attendance/logs` - Fetch attendance logs

### Admin
- `GET /api/admin/generate-qr` - Generate QR code
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - Get users list
- `POST /api/admin/users/add` - Add new user
- `PUT /api/admin/users` - Update user
- `GET /api/admin/reports` - Export admin reports

### Notifications
- `POST /api/notifications` - Send push notification
- `PUT /api/notifications` - Register device token

### Reports
- `GET /api/reports/personal` - Personal attendance report

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **QR Token Security**: HMAC-signed tokens with expiry
- **Role-based Access**: Admin/employee permission checks
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 📊 Database Schema

```prisma
model User {
  id          String       @id @default(uuid())
  email       String       @unique
  password    String
  name        String
  role        String       @default("employee")
  department  String?
  position    String?
  status      String       @default("pending")
  deviceToken String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  attendance  Attendance[]
}

model Attendance {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  sessionId String?
  type      String   // "IN" | "OUT"
  method    String   // "QR" | "NFC" | "RFID"
  token     String?
  latitude  Float?
  longitude Float?
  createdAt DateTime @default(now())
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Advanced analytics with charts
- [ ] Email notifications
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Audit logs
- [ ] Backup and restore

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**