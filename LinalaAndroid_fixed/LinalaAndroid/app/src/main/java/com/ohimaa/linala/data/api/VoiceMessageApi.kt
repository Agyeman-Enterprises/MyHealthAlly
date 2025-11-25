package com.ohimaa.linala.data.api

import com.ohimaa.linala.data.models.*
import com.ohimaa.linala.ui.theme.BrandConfig
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

/**
 * Voice Message API Interface
 */
interface VoiceMessageApi {
    
    /**
     * Submit a new voice message
     */
    @Multipart
    @POST("patient/audio-message")
    suspend fun submitVoiceMessage(
        @Part audioFile: MultipartBody.Part,
        @Part("audioFormat") audioFormat: RequestBody,
        @Part("durationSeconds") durationSeconds: RequestBody,
        @Part("patientLanguage") patientLanguage: RequestBody
    ): Response<VoiceMessageSubmitResponse>
    
    /**
     * Get list of voice messages
     */
    @GET("patient/voice-messages")
    suspend fun getVoiceMessages(
        @Query("page") page: Int = 1,
        @Query("perPage") perPage: Int = 20
    ): Response<VoiceMessagesListResponse>
    
    /**
     * Get voice message details
     */
    @GET("patient/voice-messages/{id}")
    suspend fun getVoiceMessageDetail(
        @Path("id") messageId: String
    ): Response<VoiceMessageDetail>
    
    /**
     * Request audio playback URL
     */
    @POST("patient/voice-messages/{id}/request-audio")
    suspend fun requestAudioUrl(
        @Path("id") messageId: String
    ): Response<AudioUrlResponse>
    
    /**
     * Mark message as read
     */
    @POST("patient/voice-messages/{id}/mark-read")
    suspend fun markAsRead(
        @Path("id") messageId: String
    ): Response<Unit>
    
    /**
     * Register device for push notifications
     */
    @POST("patient/devices")
    suspend fun registerDevice(
        @Body request: DeviceRegistrationRequest
    ): Response<Unit>
}

/**
 * API Response wrapper
 */
data class VoiceMessagesListResponse(
    val messages: List<VoiceMessagePreview>,
    val page: Int,
    val perPage: Int,
    val totalCount: Int,
    val hasMore: Boolean
)

data class DeviceRegistrationRequest(
    val token: String,
    val platform: String = "android"
)

/**
 * API Service Factory
 */
object ApiService {
    
    private var authToken: String? = null
    
    fun setAuthToken(token: String) {
        authToken = token
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")
                .apply {
                    authToken?.let {
                        addHeader("Authorization", "Bearer $it")
                    }
                }
                .build()
            chain.proceed(request)
        }
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BrandConfig.apiBaseUrl + "/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val voiceMessageApi: VoiceMessageApi = retrofit.create(VoiceMessageApi::class.java)
}

/**
 * Mock API Service for Phase 1 testing
 */
object MockVoiceMessageService {
    
    private val mockMessages = listOf(
        VoiceMessagePreview(
            id = "vm_001",
            createdAt = java.time.Instant.now().minusSeconds(3600),
            transcriptPreview = "I've been having some mild cramping...",
            hasAISummary = true,
            isRead = true,
            durationSeconds = 45,
            languageCode = "en"
        ),
        VoiceMessagePreview(
            id = "vm_002",
            createdAt = java.time.Instant.now().minusSeconds(86400),
            transcriptPreview = "My blood pressure reading this morning...",
            hasAISummary = true,
            isRead = true,
            durationSeconds = 32,
            languageCode = "en"
        ),
        VoiceMessagePreview(
            id = "vm_003",
            createdAt = java.time.Instant.now().minusSeconds(172800),
            transcriptPreview = "Hu tungo' i medisina-ku...",
            hasAISummary = true,
            isRead = false,
            durationSeconds = 58,
            languageCode = "ch" // Chamorro
        )
    )
    
    suspend fun getVoiceMessages(): List<VoiceMessagePreview> {
        // Simulate network delay
        kotlinx.coroutines.delay(500)
        return mockMessages
    }
    
    suspend fun getVoiceMessageDetail(messageId: String): VoiceMessageDetail? {
        kotlinx.coroutines.delay(300)
        
        return when (messageId) {
            "vm_001" -> VoiceMessageDetail(
                id = "vm_001",
                createdAt = java.time.Instant.now().minusSeconds(3600),
                transcript = "I've been experiencing some mild cramping in my lower abdomen since yesterday morning. It's not severe, but it comes and goes every few hours.",
                durationSeconds = 45,
                aiSummary = "Patient reports intermittent mild lower abdominal cramping starting yesterday. No associated bleeding or other symptoms.",
                aiTriageLevel = TriageLevel.ROUTINE,
                hasAudioAvailableToPatient = true,
                careTeamResponse = CareTeamResponse(
                    respondedAt = java.time.Instant.now().minusSeconds(1800),
                    responderName = "Dr. Sarah Chen",
                    responderTitle = "OB-GYN",
                    message = "Thank you for letting us know. Mild intermittent cramping is common during pregnancy.",
                    actionItems = listOf("Rest when cramping occurs", "Stay hydrated", "Call if symptoms worsen")
                )
            )
            else -> null
        }
    }
    
    suspend fun submitVoiceMessage(audioData: ByteArray, durationSeconds: Int): VoiceMessageSubmitResponse {
        kotlinx.coroutines.delay(1500)
        return VoiceMessageSubmitResponse(
            messageId = "vm_new_${System.currentTimeMillis()}",
            status = "processing",
            estimatedResponseTime = "24 hours"
        )
    }
}
