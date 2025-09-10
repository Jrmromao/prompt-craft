import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AuditService } from '@/lib/services/auditService'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const auditService = AuditService.getInstance()
    const logs = await auditService.getAuditLogs(userId, { limit })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logEntry = await request.json()
    const auditService = AuditService.getInstance()
    
    await auditService.logAudit({
      ...logEntry,
      userId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 })
  }
}
