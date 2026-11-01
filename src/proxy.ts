import { withAuth } from "next-auth/middleware";

// Optimistic redirect saja (UX). Otorisasi sebenarnya tetap di guard server setiap route.
export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: ["/guru/:path*", "/siswa/:path*", "/admin/:path*"],
};
