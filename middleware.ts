import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER = 'your_username' //123
const PASS = 'your_password' //123

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8')
    const [user, pass] = credentials.split(':')

    if (user === USER && pass === PASS) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}