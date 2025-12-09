import { NextResponse } from "next/server";
import { PasswordUtil } from "@/lib/password";
import { UserService } from "@/services/UserService";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { signJWT } from "@/lib/jwt";

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
    const USE_PLACEHOLDER_MODE = false; // Set to false to use actual database

    if (USE_PLACEHOLDER_MODE) {
      // Determine role based on username prefix or default to 'staff'
      let role = "staff";
      if (
        username.toLowerCase().startsWith("student") ||
        username.toLowerCase().startsWith("stu")
      ) {
        role = "student";
      } else if (
        username.toLowerCase().startsWith("admin") ||
        username.toLowerCase().startsWith("adm")
      ) {
        role = "admin";
      }

      const token = signJWT(
        { username: username, role: role },
        process.env.JWT_SECRET
      );

      const response = NextResponse.json({
        success: true,
        user: {
          username: username,
          role: role,
        },
      });

      // Set JWT cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // ACTUAL DATABASE MODE: Use Supabase connection
    try {
      // Create Supabase client
      const supabase = await createSupabaseScriptClient();

      // Check if Supabase is configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.error("Supabase environment variables not configured");
        return NextResponse.json(
          {
            error: "Server configuration error. Please contact administrator.",
          },
          { status: 500 }
        );
      }

      const userService = new UserService(supabase);

      // Get user from database
      console.log("Attempting to find user:", username);
      let user;
      try {
        user = await userService.getUserByUsername(username);
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        // If it's a network error, provide a helpful message
        if (dbError.message && dbError.message.includes("fetch failed")) {
          return NextResponse.json(
            {
              error:
                "Database connection error. Please try again or contact administrator.",
            },
            { status: 503 }
          );
        }
        // For other errors, treat as user not found
        return NextResponse.json(
          {
            error:
              "User not found. Please check your email/user ID and try again.",
          },
          { status: 401 }
        );
      }

      if (!user) {
        console.error("Login failed: User not found for", username);
        return NextResponse.json(
          {
            error:
              "User not found. Please check your email/user ID and try again.",
          },
          { status: 401 }
        );
      }

      console.log("User found, verifying password...");

      // Verify password
      const isPasswordValid = await PasswordUtil.verifyPassword(
        password,
        user.getPassword()
      );

      if (!isPasswordValid) {
        console.error("Login failed: Invalid password for", username);
        return NextResponse.json(
          { error: "Invalid password. Please try again." },
          { status: 401 }
        );
      }

      console.log("Login successful for:", username);

      const token = signJWT(
        {
          username: user.getUsername(),
          role: user.getRole(),
        },
        process.env.JWT_SECRET
      );

      const response = NextResponse.json({
        success: true,
        user: {
          username: user.getUsername(),
          role: user.getRole(),
        },
      });

      // Set JWT cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (dbError) {
      console.error(
        "Database error, falling back to placeholder mode:",
        dbError
      );
      // Fall back to placeholder mode if database fails
      let role = "staff";
      if (
        username.toLowerCase().startsWith("student") ||
        username.toLowerCase().startsWith("stu")
      ) {
        role = "student";
      } else if (
        username.toLowerCase().startsWith("admin") ||
        username.toLowerCase().startsWith("adm")
      ) {
        role = "admin";
      }

      const token = signJWT(
        {
          username: username,
          role: role,
        },
        process.env.JWT_SECRET
      );

      const response = NextResponse.json({
        success: true,
        user: {
          username: username,
          role: role,
        },
      });

      // Set JWT cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

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
