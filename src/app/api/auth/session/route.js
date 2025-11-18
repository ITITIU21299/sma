import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get cookie-based session
    const userCookie = request.cookies.get("user");

    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
