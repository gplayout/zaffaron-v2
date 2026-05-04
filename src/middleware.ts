import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import recipeRedirects from '@/lib/seo/recipe-redirects.json';
// Phase III v2 (P1.2) - deterministic 404 cleanup data.
// Regenerated via: scripts/recipeops/build-gsc-redirect-map-v2.mjs.
// NOTE: phantom-redirects.json is kept in /data/ for forensic reference but NOT
// imported here. The 7 candidate /cuisine/* and /category/* paths were verified
// 2026-04-25 to currently render HTTP 200 via /cuisine/[slug] and /category/[slug]
// dynamic routes (self-healed since GSC originally indexed them as 404). Adding
// phantom 308s would redirect WORKING pages — a UX change out of P1.2 scope.
// See AUDIT-LOG 2026-04-25 P1.2-v2 deploy entry + new PENDING-TODO for UX cycle.
import gone410List from '../data/410-set.json';

// O(1) Set lookup for 410 paths. Stable for the lifetime of the edge runtime instance.
const GONE_410_SET = new Set<string>(gone410List as string[]);

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'givukaorkjkksslrzuum.supabase.co';

const PROTECTED_PATHS = ['/cook/dashboard', '/cook/apply', '/favorites'];

function maybeRedirectRecipe(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only handle legacy/duplicate slugs:
  // /recipe/<slug> -> /recipe/<canonical>
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

// Phase III v2 - 410 Gone for verified-unrecoverable 404 URLs from GSC.
// 602 paths confirmed via 20/20 sample manual review (2026-04-25).
// Source: data/410-set.json (regenerable via build-gsc-redirect-map-v2.mjs).
//
// FB-001 fix (2026-04-25 20:30 PDT): Next.js NextRequest.nextUrl.pathname returns
// the URL-ENCODED form for non-ASCII chars and reserved chars (e.g., é → %C3%A9,
// & → %26). The 410-set.json entries are stored in DECODED form (raw é, raw &).
// Without decoding, ~245 of 602 entries (40.7%) silently returned 404 not 410
// (79 non-ASCII + 166 `&` entries). Fix: check both raw + URL-decoded forms.
// Defense-in-depth: raw first (handles agents sending pre-decoded path), then
// decoded (handles standard browser+crawler encoding).
function gone410Response(): Response {
  return new Response(null, {
    status: 410,
    headers: {
      // 24h CDN cache so each origin hit happens at most once per day per edge.
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function maybeReturn410(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 1) Raw form (covers ASCII slugs + edge cases where agent pre-decoded).
  if (GONE_410_SET.has(pathname)) return gone410Response();
  // 2) URL-decoded form (covers standard browser/crawler encoded path).
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded !== pathname && GONE_410_SET.has(decoded)) return gone410Response();
  } catch {
    // Malformed percent-encoding — fall through; downstream handlers will 404 naturally.
  }
  return null;
}

export async function middleware(request: NextRequest) {
  // 0) Phase III v2 - 410 Gone for verified-unrecoverable 404 URLs (fast O(1) check).
  const gone = maybeReturn410(request);
  if (gone) return gone;

  // 1) SEO redirects (existing 75-entry slug-rename map).
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
    `img-src 'self' data: https://${SUPABASE_HOST} https://*.pinimg.com`,
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
    // Phase 2.5 D-1 RC-5 test (2026-05-04): exclude /contact and /vault from middleware
    // to test whether middleware request-header reconstruction interferes with
    // Server Action POST routing (x-nextjs-action-not-found). Revertable.
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|contact|vault|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2|woff|ttf|css|js)$).*)',
  ],
};
