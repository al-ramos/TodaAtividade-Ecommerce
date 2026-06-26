import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscriptionStatus } from '@/lib/subscription'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ isActive: false, status: null })
  }

  const sub = await getUserSubscriptionStatus(session.user.id)

  return NextResponse.json({
    isActive: sub.isActive,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
  })
}
