import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import recipeRedirects from '@/lib/seo/recipe-redirects.json';

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'givukaorkjkksslrzuum.supabase.co';

const PROTECTED_PATHS = ['/cook/dashboard', '/cook/apply', '/favorites'];

function maybeRedirectRecipe(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only handle legacy/duplicate slugs:
  // /recipe/<slug> → /recipe/<canonical>
  if (!pathname.startsWith('/recipe/')) return null;

  const slug = pathname.slice('/recipe/'.length).split('/')[0];
  if (!slug) return null;

  const canonical = (recipeRedirects as Record<string, string>)[slug];
  if (!canonical || canonical === slug) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/recipe/${canonical}`;
  // Permanent redirect (SEO)
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  // 1) SEO redirects first (fast path)
  const redirect = maybeRedirectRecipe(request);
  if (redirect) return redirect;

  // 2) Generate CSP nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com`,  // unsafe-inline required: Next.js SSG injects inline scripts without nonce on Vercel
    // style-src still needs unsafe-inline for Next.js/Tailwind inline styles
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: https://${SUPABASE_HOST}`,
    `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
    "frame-ancestors 'none'",
  ].join('; ');

  // 3) Auth for protected paths
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  if (!isProtected) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2|woff|ttf|css|js)$).*)',
  ],
};
