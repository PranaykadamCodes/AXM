import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'excel'
    const department = searchParams.get('department')
    const userId = searchParams.get('userId')

    // Build where clause
    const whereClause: any = {}

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    if (userId) {
      whereClause.userId = userId
    } else if (department) {
      whereClause.user = {
        department: department
      }
    }

    // Get attendance logs
    const logs = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: [
        { user: { name: 'asc' } },
        { createdAt: 'desc' }
      ]
    })

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Attendance Report')

      // Add headers
      worksheet.columns = [
        { header: 'Employee Name', key: 'employeeName', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Position', key: 'position', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Time', key: 'time', width: 10 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Method', key: 'method', width: 10 },
        { header: 'Session ID', key: 'sessionId', width: 20 },
        { header: 'Location', key: 'location', width: 25 }
      ]

      // Style headers
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      }

      // Add data
      logs.forEach(log => {
        const date = new Date(log.createdAt)
        worksheet.addRow({
          employeeName: log.user.name,
          email: log.user.email,
          department: log.user.department || '-',
          position: log.user.position || '-',
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          type: log.type,
          method: log.method,
          sessionId: log.sessionId || '-',
          location: log.latitude && log.longitude 
            ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`
            : '-'
        })
      })

      // Add summary section
      worksheet.addRow([])
      worksheet.addRow(['Summary'])
      worksheet.getCell('A' + worksheet.rowCount).font = { bold: true }
      
      const uniqueEmployees = new Set(logs.map(log => log.userId)).size
      const checkIns = logs.filter(log => log.type === 'IN').length
      const checkOuts = logs.filter(log => log.type === 'OUT').length
      
      worksheet.addRow(['Total Employees:', uniqueEmployees])
      worksheet.addRow(['Total Records:', logs.length])
      worksheet.addRow(['Total Check-ins:', checkIns])
      worksheet.addRow(['Total Check-outs:', checkOuts])
      worksheet.addRow(['Report Period:', `${startDate || 'All time'} to ${endDate || 'Present'}`])
      worksheet.addRow(['Generated:', new Date().toLocaleString()])

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="admin-attendance-report.xlsx"`
        }
      })
    }

    // Calculate summary statistics
    const uniqueEmployees = new Set(logs.map(log => log.userId))
    const departmentStats = logs.reduce((acc: any, log) => {
      const dept = log.user.department || 'Unknown'
      if (!acc[dept]) {
        acc[dept] = { checkIns: 0, checkOuts: 0, employees: new Set() }
      }
      if (log.type === 'IN') acc[dept].checkIns++
      if (log.type === 'OUT') acc[dept].checkOuts++
      acc[dept].employees.add(log.userId)
      return acc
    }, {})

    // Convert sets to counts
    Object.keys(departmentStats).forEach(dept => {
      departmentStats[dept].employeeCount = departmentStats[dept].employees.size
      delete departmentStats[dept].employees
    })

    // Return JSON if not Excel
    return NextResponse.json({
      logs,
      summary: {
        totalRecords: logs.length,
        uniqueEmployees: uniqueEmployees.size,
        checkIns: logs.filter(log => log.type === 'IN').length,
        checkOuts: logs.filter(log => log.type === 'OUT').length,
        departmentStats,
        period: {
          start: startDate,
          end: endDate
        }
      }
    })

  } catch (error) {
    console.error('Admin report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
