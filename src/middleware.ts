import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import recipeRedirects from '@/lib/seo/recipe-redirects.json';

const PROTECTED_PATHS = ['/cook/dashboard', '/favorites'];

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

  // 2) Auth for protected paths
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const response = NextResponse.next();
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
  matcher: ['/recipe/:path*', '/cook/dashboard/:path*', '/favorites'],
};
