import { auth } from "@/lib/auth";

export default auth((req) => {
  // Optimistic redirect saja. Otorisasi sebenarnya tetap di guard server setiap route.
  if (!req.auth && (req.nextUrl.pathname.startsWith("/guru") || req.nextUrl.pathname.startsWith("/siswa"))) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/guru/:path*", "/siswa/:path*"],
};
