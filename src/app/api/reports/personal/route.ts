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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'excel'

    // Build where clause
    const whereClause: any = {
      userId: payload.userId
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Get attendance logs
    const logs = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Attendance Report')

      // Add headers
      worksheet.columns = [
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
      
      const checkIns = logs.filter(log => log.type === 'IN').length
      const checkOuts = logs.filter(log => log.type === 'OUT').length
      
      worksheet.addRow(['Total Check-ins:', checkIns])
      worksheet.addRow(['Total Check-outs:', checkOuts])
      worksheet.addRow(['Report Period:', `${startDate || 'All time'} to ${endDate || 'Present'}`])
      worksheet.addRow(['Generated:', new Date().toLocaleString()])

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="attendance-report-${payload.userId}.xlsx"`
        }
      })
    }

    // Return JSON if not Excel
    return NextResponse.json({
      logs,
      summary: {
        totalRecords: logs.length,
        checkIns: logs.filter(log => log.type === 'IN').length,
        checkOuts: logs.filter(log => log.type === 'OUT').length,
        period: {
          start: startDate,
          end: endDate
        }
      }
    })

  } catch (error) {
    console.error('Personal report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
