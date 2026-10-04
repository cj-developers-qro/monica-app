import { NextResponse, type NextRequest } from "next/server";

// Primer filtro (optimista): sin cookie de sesión, cualquier página lleva al login.
// La verificación real de la sesión y del rol ocurre en lib/auth.ts, en cada consulta y acción.
const PUBLICAS = ["/login", "/privacidad", "/salud", "/api/telegram"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLICAS.includes(pathname) || request.cookies.has("sesion")) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
