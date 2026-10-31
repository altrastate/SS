import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";
import { ALUMNI_COOKIE } from "@/lib/alumni-auth";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

const ALUMNI_PUBLIC = new Set([
  "/alumni/portal/login",
  "/alumni/portal/register",
  "/alumni/portal/verify",
  "/alumni/portal/forgot",
  "/alumni/portal/reset",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isAlumniPortal = pathname === "/alumni/portal" || pathname.startsWith("/alumni/portal/");

  if (!isAdmin && !isAlumniPortal) return NextResponse.next();

  const response = NextResponse.next();
  if (isAdmin || isAlumniPortal) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  const key = secretKey();

  if (isAdmin) {
    if (pathname === "/admin/login") return response;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !key) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const { payload } = await jwtVerify(token, key);
      if (payload.typ === "alumni" || payload.role === "alumni") {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.cookies.delete(SESSION_COOKIE);
      return redirect;
    }
  }

  if (ALUMNI_PUBLIC.has(pathname)) return response;
  const token = request.cookies.get(ALUMNI_COOKIE)?.value;
  if (!token || !key) {
    const loginUrl = new URL("/alumni/portal/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  try {
    const { payload } = await jwtVerify(token, key);
    if (payload.typ !== "alumni") {
      const loginUrl = new URL("/alumni/portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  } catch {
    const loginUrl = new URL("/alumni/portal/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete(ALUMNI_COOKIE);
    return redirect;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/alumni/portal", "/alumni/portal/:path*"],
};
