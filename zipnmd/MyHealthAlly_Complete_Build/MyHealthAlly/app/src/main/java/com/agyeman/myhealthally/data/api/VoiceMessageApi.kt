package com.agyeman.myhealthally.data.api

import com.agyeman.myhealthally.BuildConfig
import com.agyeman.myhealthally.data.models.*
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface VoiceMessageApi {

    @Multipart
    @POST("patient/audio-message")
    suspend fun submitVoiceMessage(
        @Part audioFile: MultipartBody.Part,
        @Part("audioFormat") audioFormat: RequestBody,
        @Part("durationSeconds") durationSeconds: RequestBody,
        @Part("patientLanguage") patientLanguage: RequestBody
    ): Response<VoiceMessageSubmitResponse>

    @GET("patient/voice-messages")
    suspend fun getVoiceMessages(
        @Query("page") page: Int = 1,
        @Query("perPage") perPage: Int = 20
    ): Response<VoiceMessagesListResponse>

    @GET("patient/voice-messages/{id}")
    suspend fun getVoiceMessageDetail(
        @Path("id") messageId: String
    ): Response<VoiceMessageDetail>

    @POST("patient/voice-messages/{id}/request-audio")
    suspend fun requestAudioUrl(
        @Path("id") messageId: String
    ): Response<AudioUrlResponse>

    @POST("patient/voice-messages/{id}/mark-read")
    suspend fun markAsRead(
        @Path("id") messageId: String
    ): Response<Unit>
}

object ApiService {

    private var authToken: String? = null

    fun setAuthToken(token: String) {
        authToken = token
    }

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val builder = chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")

            authToken?.let { builder.addHeader("Authorization", "Bearer $it") }

            chain.proceed(builder.build())
        }
        .addInterceptor(logging)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL + "/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val api: VoiceMessageApi = retrofit.create(VoiceMessageApi::class.java)
}
