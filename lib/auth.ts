
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: '60 days'
    })
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function getVenueIdFromToken(token: string): Promise<number | null> {
  const payload = await verifyToken(token)
  return payload?.venueId as number | null
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: '60 days'
    })
    // Admin token should have username field
    return payload?.username === 'admin'
  } catch (error) {
    return false
  }
}
