import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear cookie-based session
    const response = NextResponse.json({ success: true });
    response.cookies.delete("user");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("user");
    return response;
  }
}
