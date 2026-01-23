// NextAuth route handler - Disabled as we're using token-based auth
// Uncomment if you need NextAuth for Google OAuth or other providers

/*
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
*/

// Return 404 for now
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "NextAuth is disabled. Using token-based authentication." },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "NextAuth is disabled. Using token-based authentication." },
    { status: 404 }
  );
}