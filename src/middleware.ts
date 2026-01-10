import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const valid = Boolean(url) && Boolean(key) && !url.includes('example') && !key.includes('example')

  // Check for Local/Demo Mode Cookie
  const isLocalMode = request.cookies.get('aether_local_mode')?.value === 'true'

  // Mock for Dev Mode without Supabase OR Explicit Local Mode
  if (!valid || isLocalMode) {
    // If user is accessing dashboard, allow it.
    // If user is accessing login, we can optionally redirect to dashboard IF we knew they were logged in.
    // But since we can't check localStorage here, we just allow access to both pages.
    // The client-side code will handle the redirection if needed.
    return response
  }

  // Create a response object that we can modify
  response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect Dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect from Login if already authenticated
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - let them handle auth or not)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
