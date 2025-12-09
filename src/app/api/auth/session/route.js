import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request) {
  try {
    // Get JWT from HttpOnly cookie
    const tokenCookie = request.cookies.get("token");

    if (!tokenCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = verifyJWT(tokenCookie.value, process.env.JWT_SECRET);
    const { username, role } = payload || {};

    if (!username || !role) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        username,
        role,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
