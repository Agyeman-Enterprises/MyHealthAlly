package com.agyeman.myhealthally.data.api

import android.content.Context
import com.agyeman.myhealthally.BuildConfig
import com.agyeman.myhealthally.core.config.AppConfig
import com.agyeman.myhealthally.core.logging.Logger
import com.agyeman.myhealthally.core.network.RetryInterceptor
import com.agyeman.myhealthally.data.models.solopractice.*
import com.agyeman.myhealthally.managers.PINManager
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.HttpException
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Solopractice API Client
 * Handles authentication, token refresh, and error responses
 */
class SoloPracticeApiClient(private val context: Context) {

    private val pinManager = PINManager(context)
    private val api: SoloPracticeApi
    private var isRefreshing = false

    init {
        val logging = HttpLoggingInterceptor().apply {
            level = if (AppConfig.Features.LOGGING_ENABLED) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        val client = OkHttpClient.Builder()
            // Add retry interceptor first (outermost)
            .addInterceptor(RetryInterceptor())
            // Add auth interceptor
            .addInterceptor { chain ->
                val request = chain.request()
                val token = pinManager.getAuthToken()
                
                val newRequest = if (token != null) {
                    request.newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .addHeader("Content-Type", "application/json")
                        .build()
                } else {
                    request.newBuilder()
                        .addHeader("Content-Type", "application/json")
                        .build()
                }
                
                chain.proceed(newRequest)
            }
            // Add token refresh interceptor
            .addInterceptor { chain ->
                val startTime = System.currentTimeMillis()
                val request = chain.request()
                val response = chain.proceed(request)
                val duration = System.currentTimeMillis() - startTime
                
                // Log API call
                Logger.logApiCall(
                    method = request.method,
                    endpoint = request.url.encodedPath,
                    statusCode = response.code,
                    durationMs = duration,
                    error = if (!response.isSuccessful) Exception("HTTP ${response.code}") else null
                )
                
                // Handle 401 Unauthorized - try to refresh token
                if (response.code == 401 && !request.url.encodedPath.contains("/auth/")) {
                    response.close()
                    val refreshed = refreshTokenIfNeeded()
                    if (refreshed) {
                        // Retry the request with new token
                        val newToken = pinManager.getAuthToken()
                        val newRequest = request.newBuilder()
                            .header("Authorization", "Bearer $newToken")
                            .build()
                        return@addInterceptor chain.proceed(newRequest)
                    }
                }
                
                response
            }
            .addInterceptor(logging)
            .connectTimeout(AppConfig.Timeouts.CONNECT, TimeUnit.SECONDS)
            .readTimeout(AppConfig.Timeouts.READ, TimeUnit.SECONDS)
            .writeTimeout(AppConfig.Timeouts.WRITE, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(getBaseUrl())
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(SoloPracticeApi::class.java)
    }

    private fun getBaseUrl(): String {
        // Use BuildConfig API_BASE_URL, but ensure it ends with /
        val baseUrl = BuildConfig.API_BASE_URL
        return if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
    }

    /**
     * Refresh token if needed
     * Returns true if token was refreshed, false otherwise
     */
    private suspend fun refreshTokenIfNeeded(): Boolean {
        if (isRefreshing) {
            return false
        }

        val refreshToken = pinManager.getRefreshToken() ?: return false

        return try {
            isRefreshing = true
            val response = api.refreshToken(RefreshTokenRequest(refreshToken))
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                pinManager.saveAuthToken(body.accessToken)
                pinManager.saveRefreshToken(body.refreshToken)
                true
            } else {
                // Refresh failed, clear tokens
                pinManager.clearAuthToken()
                pinManager.clearRefreshToken()
                false
            }
        } catch (e: Exception) {
            pinManager.clearAuthToken()
            pinManager.clearRefreshToken()
            false
        } finally {
            isRefreshing = false
        }
    }

    // ==================== Authentication ====================

    suspend fun activateAccount(token: String): Result<ActivateAccountResponse> {
        return handleResponse {
            api.activateAccount(ActivateAccountRequest(token))
        }.onSuccess { response ->
            // Save tokens
            pinManager.saveAuthToken(response.accessToken)
            pinManager.saveRefreshToken(response.refreshToken)
        }
    }

    // ==================== Messages ====================

    suspend fun getThreads(): Result<List<MessageThread>> {
        return handleResponse { api.getThreads() }
    }

    suspend fun getThreadMessages(threadId: String): Result<List<MessageResponse>> {
        return handleResponse { api.getThreadMessages(threadId) }
    }

    suspend fun sendMessage(
        threadId: String,
        body: String,
        symptomScreen: SymptomScreenResult? = null,
        attachments: Map<String, Any>? = null
    ): Result<MessageResponse> {
        val request = SendMessageRequest(
            body = body,
            symptomScreen = symptomScreen?.toMap(),
            attachments = attachments
        )
        return handleResponse { api.sendMessage(threadId, request) }
    }

    suspend fun markMessageAsRead(messageId: String): Result<Unit> {
        return handleResponse { api.markMessageAsRead(messageId) }
    }

    // ==================== Medications ====================

    suspend fun getMedications(): Result<List<Medication>> {
        return handleResponse { api.getMedications() }
    }

    suspend fun requestRefill(medicationId: String): Result<RefillRequestResponse> {
        return handleResponse { api.requestRefill(RefillRequestRequest(medicationId)) }
    }

    // ==================== Measurements ====================

    suspend fun recordMeasurement(
        type: String,
        value: Map<String, Any>,
        source: String = "manual",
        metadata: Map<String, Any>? = null
    ): Result<MeasurementResponse> {
        val request = RecordMeasurementRequest(
            type = type,
            value = value,
            source = source,
            metadata = metadata
        )
        return handleResponse { api.recordMeasurement(request) }
    }

    suspend fun getMeasurements(type: String? = null, limit: Int = 100): Result<List<MeasurementResponse>> {
        return handleResponse { api.getMeasurements(type, limit) }
    }

    // ==================== Appointments ====================

    suspend fun requestAppointment(
        type: String,
        preferredDate: String? = null,
        preferredTime: String? = null,
        reason: String? = null,
        urgency: String? = null
    ): Result<AppointmentRequestResponse> {
        val request = AppointmentRequestRequest(
            type = type,
            preferredDate = preferredDate,
            preferredTime = preferredTime,
            reason = reason,
            urgency = urgency
        )
        return handleResponse { api.requestAppointment(request) }
    }

    // ==================== Error Handling ====================

    /**
     * Handle API response with proper error mapping
     */
    private suspend fun <T> handleResponse(
        apiCall: suspend () -> Response<T>
    ): Result<T> {
        return try {
            val response = apiCall()
            
            when {
                response.isSuccessful && response.body() != null -> {
                    Result.success(response.body()!!)
                }
                response.code() == 403 -> {
                    // Rule blocked the action
                    val error = parseError(response)
                    Result.failure(
                        AppError.RuleBlocked(
                            message = error?.message ?: "Action blocked by safety rule",
                            reason = error?.code
                        )
                    )
                }
                response.code() == 429 -> {
                    // Rate limited
                    val error = parseError(response)
                    Result.failure(
                        AppError.RateLimited(
                            retryAfter = error?.retryAfter ?: 60
                        )
                    )
                }
                response.code() == 401 -> {
                    // Unauthorized - token refresh should have been attempted
                    Result.failure(AppError.Unauthorized())
                }
                else -> {
                    val error = parseError(response)
                    Result.failure(
                        AppError.ApiError(
                            message = error?.message ?: "API request failed",
                            code = response.code(),
                            errorCode = error?.code
                        )
                    )
                }
            }
        } catch (e: HttpException) {
            Result.failure(
                AppError.ApiError(
                    message = e.message ?: "HTTP error",
                    code = e.code()
                )
            )
        } catch (e: IOException) {
            Result.failure(AppError.NetworkError(e.message ?: "Network error"))
        } catch (e: Exception) {
            Result.failure(AppError.UnknownError(e))
        }
    }

    private fun <T> parseError(response: Response<T>): ApiError? {
        return try {
            val errorBody = response.errorBody()?.string()
            if (errorBody != null) {
                Gson().fromJson(errorBody, ApiError::class.java)
            } else {
                null
            }
        } catch (e: JsonSyntaxException) {
            null
        }
    }

    /**
     * App-specific error types
     */
    sealed class AppError(message: String, cause: Throwable? = null) : Exception(message, cause) {
        class RuleBlocked(message: String, val reason: String? = null) : AppError(message)
        class RateLimited(val retryAfter: Int) : AppError("Rate limited. Retry after $retryAfter seconds")
        class Unauthorized : AppError("Unauthorized. Please log in again.")
        class ApiError(message: String, val code: Int, val errorCode: String? = null) : AppError(message)
        class NetworkError(message: String) : AppError(message)
        class UnknownError(cause: Throwable) : AppError("Unknown error: ${cause.message}", cause)
    }
}
