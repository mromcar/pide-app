import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { orderService } from '@/services/order-service'
import { jsonOk, jsonError } from '@/utils/api'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.role.includes('EMPLOYEE')) {
      return jsonError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const orders = await orderService.getAllOrders({
      establishment_id: session.user.establishment_id,
      status,
      fromDate,
      toDate
    })
    return jsonOk({ orders })
  } catch (error) {
    return jsonError(error.message)
  }
}
