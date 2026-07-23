import { NextRequest, NextResponse } from "next/server";
import { SHOW_BOOKS, SHOW_TRADITIONS } from "@/lib/feature-flags";

/** Better Auth uses `__Secure-` prefix on HTTPS; plain name on HTTP (local). */
function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value,
  );
}

function isHiddenPublicSurface(pathname: string): boolean {
  if (
    !SHOW_BOOKS &&
    (pathname === "/books" || pathname.startsWith("/books/"))
  ) {
    return true;
  }
  if (
    !SHOW_TRADITIONS &&
    (pathname === "/traditions" || pathname.startsWith("/traditions/"))
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
    "/traditions",
    "/traditions/:path*",
  ],
};
