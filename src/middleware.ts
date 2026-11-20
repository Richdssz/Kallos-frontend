import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const autenticado = request.cookies.get("kallos-auth")?.value;

  if (!autenticado) {
    const loginUrl = new URL("/login", request.url);

    const rotaDesejada =
      request.nextUrl.pathname + request.nextUrl.search;

    loginUrl.searchParams.set("next", rotaDesejada);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};