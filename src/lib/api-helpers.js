/**
 * Helper functions for API routes to handle errors consistently
 */
import { NextResponse } from "next/server";

/**
 * Handle API errors and return appropriate response
 * @param {Error} error - The error object
 * @param {string} context - Context description for logging
 * @returns {NextResponse} Error response
 */
export function handleApiError(error, context = "API request") {
  console.error(`Error in ${context}:`, error);

  const errorMessage = error?.message || String(error);
  const isNetworkError =
    errorMessage.includes("fetch failed") ||
    errorMessage.includes("TypeError: fetch failed") ||
    errorMessage.includes("Network error") ||
    error?.code === "ECONNREFUSED" ||
    error?.code === "ETIMEDOUT" ||
    error?.code === "ENOTFOUND";

  if (isNetworkError) {
    return NextResponse.json(
      {
        error:
          "Database connection error. Please try again or refresh the page.",
      },
      { status: 503 } // Service Unavailable
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Wrap an async API handler with error handling
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler
 */
export function withErrorHandling(handler) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      return handleApiError(error, handler.name || "API handler");
    }
  };
}
