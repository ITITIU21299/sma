/**
 * Retry utility for handling transient network failures
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 100)
 * @returns {Promise<any>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 100) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if it's a network error that should be retried
      const isNetworkError =
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("TypeError: fetch failed") ||
        error?.code === "ECONNREFUSED" ||
        error?.code === "ETIMEDOUT" ||
        error?.code === "ENOTFOUND";

      // Don't retry if it's not a network error or we've exhausted retries
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Execute a Supabase query with retry logic
 * @param {Function} queryFn - Function that returns a Supabase query promise
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<{data: any, error: any}>} Supabase query result
 */
export async function retrySupabaseQuery(queryFn, maxRetries = 3) {
  return retryWithBackoff(async () => {
    const result = await queryFn();

    // Check if the error is a network error
    if (result.error) {
      const errorMessage = result.error.message || String(result.error);
      const isNetworkError =
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("TypeError: fetch failed") ||
        result.error.code === "ECONNREFUSED" ||
        result.error.code === "ETIMEDOUT" ||
        result.error.code === "ENOTFOUND";

      if (isNetworkError) {
        throw new Error(`Network error: ${errorMessage}`);
      }
    }

    return result;
  }, maxRetries);
}
