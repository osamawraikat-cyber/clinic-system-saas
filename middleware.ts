import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/navigation'

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to handle locale routing and redirects
    const response = intlMiddleware(request)

    // If next-intl returned a redirect (e.g. / -> /en), return it immediately
    if (response.status === 307 || response.status === 308) {
        return response
    }

    // 2. Setup Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        data: { session },
    } = await supabase.auth.getSession()

    // Protected routes must account for the locale prefix (e.g., /en/dashboard)
    // We regex against path like /:locale/path
    const pathname = request.nextUrl.pathname

    // Helper to check if path is protected
    const protectedSegments = [
        'dashboard',
        'patients',
        'appointments',
        'visits',
        'procedures',
        'invoices',
        'settings',
    ]

    // Check if the path (stripping locale) matches any protected segment
    // Path might be /en/dashboard or /dashboard (if missing locale, intlMiddleware handles it, but we double check)
    const isProtectedPath = protectedSegments.some(segment =>
        pathname.match(new RegExp(`^/(${['en', 'ar', 'tr'].join('|')})/${segment}`)) ||
        pathname.startsWith(`/${segment}`)
    )

    // Redirect to login if not authenticated
    if (!session && isProtectedPath) {
        // Construct login URL with locale
        // We assume the locale is the first segment if present, else default 'en'
        const localeMatch = pathname.match(/^\/(en|ar|tr)/)
        const locale = localeMatch ? localeMatch[1] : 'en'

        const redirectUrl = new URL(`/${locale}/login`, request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if logged in and accessing login/signup
    if (session) {
        const isAuthPage = pathname.match(/^\/(en|ar|tr)\/(login|signup)$/) || pathname.match(/^\/(login|signup)$/)
        if (isAuthPage) {
            const localeMatch = pathname.match(/^\/(en|ar|tr)/)
            const locale = localeMatch ? localeMatch[1] : 'en'
            return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
        }
    }

    // SaaS: Fetch Tenant Context
    if (session) {
        const { data: clinicIds } = await supabase.rpc('get_my_clinic_ids')
        const currentClinicId = clinicIds?.[0]

        if (currentClinicId) {
            response.headers.set('x-clinic-id', currentClinicId)
            response.cookies.set('clinic_id', currentClinicId, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })
        }
    }

    return response
}

export const config = {
    matcher: [
        // Exclude static files, API routes, and Next.js internals from middleware
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
    ],
}
