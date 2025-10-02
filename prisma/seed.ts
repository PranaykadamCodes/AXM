import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      department: 'IT',
      position: 'System Admin'
    }
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample employees
  const employees = [
    {
      email: 'john.doe@company.com',
      name: 'John Doe',
      department: 'Engineering',
      position: 'Software Developer'
    },
    {
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      department: 'Marketing',
      position: 'Marketing Manager'
    },
    {
      email: 'bob.johnson@company.com',
      name: 'Bob Johnson',
      department: 'Sales',
      position: 'Sales Representative'
    },
    {
      email: 'alice.brown@company.com',
      name: 'Alice Brown',
      department: 'HR',
      position: 'HR Specialist'
    },
    {
      email: 'charlie.wilson@company.com',
      name: 'Charlie Wilson',
      department: 'Engineering',
      position: 'Senior Developer'
    }
  ]

  const employeePassword = await bcrypt.hash('employee123', 12)

  for (const emp of employees) {
    const employee = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        password: employeePassword,
        name: emp.name,
        role: 'employee',
        status: 'active',
        department: emp.department,
        position: emp.position
      }
    })
    console.log('✅ Created employee:', employee.email)
  }

  // Create some sample attendance records
  const users = await prisma.user.findMany({
    where: { role: 'employee' }
  })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  for (const user of users.slice(0, 3)) {
    // Create attendance for today
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Check in
    await prisma.attendance.create({
      data: {
        userId: user.id,
        sessionId,
        type: 'IN',
        method: 'QR',
        token: 'sample_qr_token',
        createdAt: new Date(today.getTime() + 9 * 60 * 60 * 1000) // 9 AM
      }
    })

    // Check out (for some users)
    if (Math.random() > 0.3) {
      await prisma.attendance.create({
        data: {
          userId: user.id,
          sessionId,
          type: 'OUT',
          method: 'QR',
          token: 'sample_qr_token',
          createdAt: new Date(today.getTime() + 17 * 60 * 60 * 1000) // 5 PM
        }
      })
    }

    console.log('✅ Created attendance records for:', user.name)
  }

  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('Admin: admin@company.com / admin123')
  console.log('Employee: john.doe@company.com / employee123')
  console.log('Employee: jane.smith@company.com / employee123')
  console.log('(and others...)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
