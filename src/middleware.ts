
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const autenticado =
    request.cookies.get("kallos-auth")?.value === "true";

  const caminho = request.nextUrl.pathname;

  const rotasPublicas = [
    "/login",
    "/criar-conta",
    "/redefinir-senha",
  ];

  // Usuário autenticado não precisa acessar páginas públicas.
  if (autenticado && rotasPublicas.includes(caminho)) {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  // Usuário não autenticado não pode acessar páginas protegidas.
  if (!autenticado && !rotasPublicas.includes(caminho)) {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
