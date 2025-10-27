import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/',
      error: '/',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}


