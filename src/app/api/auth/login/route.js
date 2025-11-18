import { NextResponse } from "next/server";
import { PasswordUtil } from "@/lib/password";
import { UserService } from "@/services/UserService";
import { createSupabaseScriptClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // PLACEHOLDER MODE: Accept any username/password for testing
    // Remove this block when database is properly configured
    const USE_PLACEHOLDER_MODE = true; // Set to false to use actual database
    
    if (USE_PLACEHOLDER_MODE) {
      // Determine role based on username prefix or default to 'staff'
      let role = "staff";
      if (username.toLowerCase().startsWith("student") || username.toLowerCase().startsWith("stu")) {
        role = "student";
      }

      const response = NextResponse.json({
        success: true,
        user: {
          username: username,
          role: role,
        },
      });

      // Set session cookie
      response.cookies.set(
        "user",
        JSON.stringify({
          username: username,
          role: role,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        }
      );

      return response;
    }

    // ACTUAL DATABASE MODE: Use Supabase connection
    try {
      // Create Supabase client
      const supabase = await createSupabaseScriptClient();
      const userService = new UserService(supabase);

      // Get user from database
      const user = await userService.getUserByUsername(username);

      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please try again." },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await PasswordUtil.verifyPassword(
        password,
        user.getPassword()
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid password. Please try again." },
          { status: 401 }
        );
      }

      // Create session using cookie-based authentication
      const response = NextResponse.json({
        success: true,
        user: {
          username: user.getUsername(),
          role: user.getRole(),
        },
      });

      // Set session cookie
      response.cookies.set(
        "user",
        JSON.stringify({
          username: user.getUsername(),
          role: user.getRole(),
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        }
      );

      return response;
    } catch (dbError) {
      console.error("Database error, falling back to placeholder mode:", dbError);
      // Fall back to placeholder mode if database fails
      let role = "staff";
      if (username.toLowerCase().startsWith("student") || username.toLowerCase().startsWith("stu")) {
        role = "student";
      }

      const response = NextResponse.json({
        success: true,
        user: {
          username: username,
          role: role,
        },
      });

      response.cookies.set(
        "user",
        JSON.stringify({
          username: username,
          role: role,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      return response;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
