/**
 * Network retry utility for handling failed fetch errors
 * Implements exponential backoff for retries
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, options: Required<RetryOptions>): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true; // Network errors are always retryable
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return options.retryableErrors.some((retryable) =>
      errorMessage.includes(retryable.toLowerCase())
    );
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = Math.min(
    options.initialDelay * Math.pow(2, attempt),
    options.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, opts)) {
        throw error; // Non-retryable error, throw immediately
      }

      // Check status code if it's a response error
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (!opts.retryableStatuses.includes(status)) {
          throw error; // Non-retryable status code
        }
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Wrapper for fetch with automatic retry
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(input, init);
      
      // Check if response indicates a retryable error
      if (!response.ok && options?.retryableStatuses?.includes(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    },
    options
  );
}
