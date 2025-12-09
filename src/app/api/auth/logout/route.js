import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear JWT cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    return response;
  }
}
