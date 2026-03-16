import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except api, static assets, etc.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|next.svg|vercel.svg).*)"],
};
