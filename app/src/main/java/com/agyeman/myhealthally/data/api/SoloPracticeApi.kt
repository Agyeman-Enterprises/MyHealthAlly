package com.agyeman.myhealthally.data.api

import com.agyeman.myhealthally.data.models.solopractice.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Solopractice API Interface
 * All endpoints go through /api/portal/* to ensure CG rules (R1-R12) are enforced server-side
 */
interface SoloPracticeApi {

    // ==================== Authentication ====================

    /**
     * Activate patient account and get JWT token
     * Endpoint: POST /api/portal/auth/activate
     */
    @POST("api/portal/auth/activate")
    suspend fun activateAccount(
        @Body request: ActivateAccountRequest
    ): Response<ActivateAccountResponse>

    /**
     * Refresh access token
     * Endpoint: POST /api/portal/auth/refresh
     */
    @POST("api/portal/auth/refresh")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<RefreshTokenResponse>

    // ==================== Messages ====================

    /**
     * Get patient's message threads
     * Endpoint: GET /api/portal/messages/threads
     * CG Rules: R10 (Patient Transparency Logging)
     */
    @GET("api/portal/messages/threads")
    suspend fun getThreads(): Response<List<MessageThread>>

    /**
     * Get messages in a thread
     * Endpoint: GET /api/portal/messages/threads/{id}
     * CG Rules: R10 (Patient Transparency Logging)
     */
    @GET("api/portal/messages/threads/{id}")
    suspend fun getThreadMessages(
        @Path("id") threadId: String
    ): Response<List<MessageResponse>>

    /**
     * Send a message (voice or text)
     * Endpoint: POST /api/portal/messages/threads/{id}/messages
     * CG Rules: R1 (Practice Hours), R2 (Emergency Intercept), R3 (After-Hours Deferral)
     */
    @POST("api/portal/messages/threads/{id}/messages")
    suspend fun sendMessage(
        @Path("id") threadId: String,
        @Body request: SendMessageRequest
    ): Response<MessageResponse>

    /**
     * Mark message as read
     * Endpoint: PATCH /api/portal/messages/{id}/read
     */
    @PATCH("api/portal/messages/{id}/read")
    suspend fun markMessageAsRead(
        @Path("id") messageId: String
    ): Response<Unit>

    // ==================== Medications ====================

    /**
     * Get patient's medications
     * Endpoint: GET /api/portal/meds
     * CG Rules: R10 (Patient Transparency Logging)
     */
    @GET("api/portal/meds")
    suspend fun getMedications(): Response<List<Medication>>

    /**
     * Request medication refill
     * Endpoint: POST /api/portal/meds/refill-requests
     * CG Rules: R7 (Refill Request Safety Gate)
     */
    @POST("api/portal/meds/refill-requests")
    suspend fun requestRefill(
        @Body request: RefillRequestRequest
    ): Response<RefillRequestResponse>

    // ==================== Measurements ====================

    /**
     * Record a measurement (vital sign)
     * Endpoint: POST /api/portal/measurements
     * CG Rules: R4 (Urgency Classification), R5 (Hard Escalation for Red Items)
     */
    @POST("api/portal/measurements")
    suspend fun recordMeasurement(
        @Body request: RecordMeasurementRequest
    ): Response<MeasurementResponse>

    /**
     * Get patient's measurements
     * Endpoint: GET /api/portal/measurements
     * CG Rules: R10 (Patient Transparency Logging)
     */
    @GET("api/portal/measurements")
    suspend fun getMeasurements(
        @Query("type") type: String? = null,
        @Query("limit") limit: Int = 100
    ): Response<List<MeasurementResponse>>

    // ==================== Appointments ====================

    /**
     * Request an appointment
     * Endpoint: POST /api/portal/appointments/request
     * CG Rules: R1 (Practice Hours), R4 (Urgency Classification)
     */
    @POST("api/portal/appointments/request")
    suspend fun requestAppointment(
        @Body request: AppointmentRequestRequest
    ): Response<AppointmentRequestResponse>
}
