package com.agyeman.myhealthally.core.network

import com.agyeman.myhealthally.core.config.AppConfig
import com.agyeman.myhealthally.core.logging.Logger
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import kotlin.math.min
import kotlin.math.pow

/**
 * Retry Interceptor with Exponential Backoff
 * 
 * Automatically retries failed network requests with exponential backoff
 * Implements enterprise-grade resilience for network operations
 */
class RetryInterceptor(
    private val maxRetries: Int = AppConfig.Retry.MAX_RETRIES,
    private val initialBackoffMs: Long = AppConfig.Retry.INITIAL_BACKOFF_MS,
    private val maxBackoffMs: Long = AppConfig.Retry.MAX_BACKOFF_MS,
    private val backoffMultiplier: Double = AppConfig.Retry.BACKOFF_MULTIPLIER
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        var response: Response? = null
        var lastException: IOException? = null
        
        // Don't retry non-idempotent requests (POST, PUT, DELETE) unless explicitly marked
        if (!isRetryable(request)) {
            return chain.proceed(request)
        }
        
        for (attempt in 0..maxRetries) {
            try {
                response = chain.proceed(request)
                
                // Retry on server errors (5xx) and rate limiting (429)
                if (response.isSuccessful || !shouldRetry(response, attempt)) {
                    return response
                }
                
                response.close()
                
                // Calculate backoff delay
                val backoffDelay = calculateBackoff(attempt)
                Logger.d("Retry", "Request failed, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/$maxRetries)")
                
                Thread.sleep(backoffDelay)
                
            } catch (e: IOException) {
                lastException = e
                
                // Don't retry on the last attempt
                if (attempt == maxRetries) {
                    Logger.e("Retry", "Request failed after $maxRetries retries", e)
                    throw e
                }
                
                // Calculate backoff delay
                val backoffDelay = calculateBackoff(attempt)
                Logger.d("Retry", "Network error, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/$maxRetries)", e)
                
                try {
                    Thread.sleep(backoffDelay)
                } catch (ie: InterruptedException) {
                    Thread.currentThread().interrupt()
                    throw IOException("Retry interrupted", ie)
                }
            }
        }
        
        // If we get here, all retries failed
        response?.close()
        throw lastException ?: IOException("Request failed after $maxRetries retries")
    }
    
    /**
     * Check if request is retryable
     */
    private fun isRetryable(request: Request): Boolean {
        val method = request.method
        // Only retry idempotent methods by default
        // For POST/PUT/DELETE, we'd need explicit retry headers or configuration
        return method == "GET" || method == "HEAD" || method == "OPTIONS"
    }
    
    /**
     * Determine if we should retry based on response code
     */
    private fun shouldRetry(response: Response, attempt: Int): Boolean {
        if (attempt >= maxRetries) return false
        
        val code = response.code
        
        // Retry on server errors (5xx)
        if (code in 500..599) {
            return true
        }
        
        // Retry on rate limiting (429)
        if (code == 429) {
            // Check Retry-After header if present
            val retryAfter = response.header("Retry-After")?.toLongOrNull()
            if (retryAfter != null && retryAfter > 0) {
                try {
                    Thread.sleep(retryAfter * 1000)
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                }
            }
            return true
        }
        
        // Retry on specific client errors that might be transient
        if (code == 408) { // Request Timeout
            return true
        }
        
        return false
    }
    
    /**
     * Calculate exponential backoff delay
     */
    private fun calculateBackoff(attempt: Int): Long {
        val delay = (initialBackoffMs * backoffMultiplier.pow(attempt)).toLong()
        return min(delay, maxBackoffMs)
    }
}
