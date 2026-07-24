import { NextRequest, NextResponse } from "next/server";
import {
  SHOW_BOOKS,
  SHOW_PILGRIMAGE,
  SHOW_TRADITIONS,
} from "@/lib/feature-flags";

/** Better Auth uses `__Secure-` prefix on HTTPS; plain name on HTTP (local). */
function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value,
  );
}

/** True for static files under a feature path (e.g. /traditions/zen.jpg). */
function hasStaticFileExtension(pathname: string): boolean {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function isHiddenPublicSurface(pathname: string): boolean {
  if (
    !SHOW_BOOKS &&
    (pathname === "/books" || pathname.startsWith("/books/")) &&
    !hasStaticFileExtension(pathname)
  ) {
    return true;
  }
  // Gate traditions article routes only. Placeholder images live at
  // /traditions/*.jpg and must stay public for place cards without photos.
  if (
    !SHOW_TRADITIONS &&
    (pathname === "/traditions" || pathname.startsWith("/traditions/")) &&
    !hasStaticFileExtension(pathname)
  ) {
    return true;
  }
  if (
    !SHOW_PILGRIMAGE &&
    (pathname === "/pilgrimage" || pathname.startsWith("/pilgrimage/")) &&
    !hasStaticFileExtension(pathname)
  ) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Unmatched rewrite yields a real HTTP 404 (page-level notFound() can stream 200).
  if (isHiddenPublicSurface(pathname)) {
    return NextResponse.rewrite(new URL("/__feature_off", request.url));
  }

  const hasSession = hasSessionCookie(request);

  if (pathname.startsWith("/manage")) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === "/admin/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manage",
    "/manage/:path*",
    "/books",
    "/books/:path*",
    /*
     * Match traditions pages (/traditions, /traditions/zen) but not static
     * assets (/traditions/zen.jpg) used as place photo fallbacks.
     */
    "/traditions",
    "/traditions/:slug((?!.*\\.).*)",
    "/pilgrimage",
    "/pilgrimage/:path*",
  ],
};
