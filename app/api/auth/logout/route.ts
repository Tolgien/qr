
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Cookie'yi sil
  response.cookies.delete('authToken')
  
  return response
}
