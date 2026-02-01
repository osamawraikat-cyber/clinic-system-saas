import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

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
        data: { session },
    } = await supabase.auth.getSession()

    // Protect dashboard routes
    const protectedPaths = [
        '/dashboard',
        '/patients',
        '/appointments',
        '/visits',
        '/procedures',
        '/invoices',
        '/settings',
    ]

    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Redirect to login if not authenticated
    if (!session && isProtectedPath) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if already logged in and trying to access login
    if (session && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // SaaS: Fetch Tenant Context (Clinic ID) and pass it to headers
    if (session) {
        // We use the new RPC function to get clinic_ids efficiently without RLS recursion issues
        const { data: clinicIds } = await supabase.rpc('get_my_clinic_ids')

        // For V1, we just take the first clinic (Single Clinic per User)
        const currentClinicId = clinicIds?.[0]

        if (currentClinicId) {
            // Store in request headers so Server Components can read it easily
            response.headers.set('x-clinic-id', currentClinicId)

            // Also set a secure cookie for client-side access if needed (optional but helpful)
            response.cookies.set('clinic_id', currentClinicId, {
                httpOnly: false, // Allow client JS to read it for UI logic
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
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
