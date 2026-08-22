import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  // Ignore static assets, next internals, and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing (e.g. during initial Vercel build/setup), fail gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing in middleware.');
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Public routes that don't require auth
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // If not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // If authenticated and trying to access auth pages, redirect based on role
    if (user && isPublicRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const url = request.nextUrl.clone();
      if (profile?.role === 'hr') {
        url.pathname = '/hr/dashboard';
      } else {
        url.pathname = '/employee/home';
      }
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role;

      // Prevent employees from accessing HR routes
      if (pathname.startsWith('/hr') && role !== 'hr') {
        const url = request.nextUrl.clone();
        url.pathname = '/employee/home';
        return NextResponse.redirect(url);
      }

      // Redirect root to appropriate dashboard
      if (pathname === '/') {
        const url = request.nextUrl.clone();
        if (role === 'hr') {
          url.pathname = '/hr/dashboard';
        } else {
          url.pathname = '/employee/home';
        }
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.error('Middleware execution error:', err);
    // Never crash the request
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
