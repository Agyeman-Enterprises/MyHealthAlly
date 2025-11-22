package com.myhealthally.app.data.network

import com.myhealthally.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("patients")
    suspend fun getPatients(): Response<List<Patient>>

    @GET("patients/{id}")
    suspend fun getPatient(@Path("id") id: String): Response<Patient>

    @GET("patients/{id}/measurements")
    suspend fun getMeasurements(@Path("id") id: String): Response<List<Measurement>>

    @POST("patients/{id}/measurements")
    suspend fun createMeasurement(
        @Path("id") id: String,
        @Body measurement: CreateMeasurementRequest
    ): Response<Measurement>

    @GET("alerts/patients/{id}")
    suspend fun getAlerts(@Path("id") id: String): Response<List<Alert>>

    @GET("messaging/threads")
    suspend fun getThreads(): Response<List<MessageThread>>

    @GET("messaging/threads/{id}")
    suspend fun getThread(@Path("id") id: String): Response<MessageThread>

    @POST("messaging/threads/{id}/messages")
    suspend fun sendMessage(
        @Path("id") id: String,
        @Body message: SendMessageRequest
    ): Response<Message>
}

