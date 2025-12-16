package com.agyeman.myhealthally.data.models

import com.google.gson.annotations.SerializedName

data class VoiceMessage(
    @SerializedName("id") val id: String,
    @SerializedName("patientId") val patientId: String,
    @SerializedName("providerId") val providerId: String?,
    @SerializedName("providerName") val providerName: String?,
    @SerializedName("providerRole") val providerRole: String?,
    @SerializedName("providerAvatar") val providerAvatar: String?,
    @SerializedName("audioUrl") val audioUrl: String?,
    @SerializedName("transcriptText") val transcriptText: String?,
    @SerializedName("audioFormat") val audioFormat: String,
    @SerializedName("durationSeconds") val durationSeconds: Int,
    @SerializedName("status") val status: MessageStatus,
    @SerializedName("direction") val direction: MessageDirection,
    @SerializedName("isRead") val isRead: Boolean,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

enum class MessageStatus {
    @SerializedName("pending") PENDING,
    @SerializedName("processing") PROCESSING,
    @SerializedName("completed") COMPLETED,
    @SerializedName("failed") FAILED
}

enum class MessageDirection {
    @SerializedName("inbound") INBOUND,
    @SerializedName("outbound") OUTBOUND
}

data class VoiceMessageSubmitResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("messageId") val messageId: String?,
    @SerializedName("message") val message: String?
)

data class VoiceMessagesListResponse(
    @SerializedName("messages") val messages: List<VoiceMessage>,
    @SerializedName("pagination") val pagination: Pagination
)

data class Pagination(
    @SerializedName("currentPage") val currentPage: Int,
    @SerializedName("perPage") val perPage: Int,
    @SerializedName("totalPages") val totalPages: Int,
    @SerializedName("totalCount") val totalCount: Int
)

data class VoiceMessageDetail(
    @SerializedName("message") val message: VoiceMessage
)

data class AudioUrlResponse(
    @SerializedName("audioUrl") val audioUrl: String,
    @SerializedName("expiresAt") val expiresAt: String
)
