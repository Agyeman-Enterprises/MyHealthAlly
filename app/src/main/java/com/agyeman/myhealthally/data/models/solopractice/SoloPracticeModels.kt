package com.agyeman.myhealthally.data.models.solopractice

import com.google.gson.annotations.SerializedName

/**
 * Solopractice API Models
 * Based on SOLOPRACTICE_INTEGRATION_GUIDE.md
 */

// ==================== Authentication ====================

data class ActivateAccountRequest(
    @SerializedName("token") val token: String
)

data class ActivateAccountResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("practice_id") val practiceId: String
)

data class RefreshTokenRequest(
    @SerializedName("refresh_token") val refreshToken: String
)

data class RefreshTokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String
)

// ==================== Symptom Screen ====================

/**
 * Symptom screen data collected before sending after-hours messages
 * Used for R2: Emergency Intercept
 */
data class SymptomScreenResult(
    @SerializedName("has_chest_pain") val hasChestPain: Boolean = false,
    @SerializedName("has_shortness_of_breath") val hasShortnessOfBreath: Boolean = false,
    @SerializedName("has_severe_bleeding") val hasSevereBleeding: Boolean = false,
    @SerializedName("has_severe_allergic_reaction") val hasSevereAllergicReaction: Boolean = false,
    @SerializedName("has_loss_of_consciousness") val hasLossOfConsciousness: Boolean = false,
    @SerializedName("has_severe_burn") val hasSevereBurn: Boolean = false,
    @SerializedName("has_severe_head_injury") val hasSevereHeadInjury: Boolean = false,
    @SerializedName("has_severe_abdominal_pain") val hasSevereAbdominalPain: Boolean = false,
    @SerializedName("other_emergency_symptoms") val otherEmergencySymptoms: String? = null
) {
    fun toMap(): Map<String, Any> {
        return mapOf(
            "has_chest_pain" to hasChestPain,
            "has_shortness_of_breath" to hasShortnessOfBreath,
            "has_severe_bleeding" to hasSevereBleeding,
            "has_severe_allergic_reaction" to hasSevereAllergicReaction,
            "has_loss_of_consciousness" to hasLossOfConsciousness,
            "has_severe_burn" to hasSevereBurn,
            "has_severe_head_injury" to hasSevereHeadInjury,
            "has_severe_abdominal_pain" to hasSevereAbdominalPain
        ).plus(otherEmergencySymptoms?.let { mapOf("other_emergency_symptoms" to it) } ?: emptyMap())
    }
}

// ==================== Messages ====================

data class SendMessageRequest(
    @SerializedName("body") val body: String,
    @SerializedName("symptom_screen") val symptomScreen: Map<String, Any>? = null,
    @SerializedName("attachments") val attachments: Map<String, Any>? = null
)

data class MessageResponse(
    @SerializedName("id") val id: String,
    @SerializedName("thread_id") val threadId: String,
    @SerializedName("sender_id") val senderId: String,
    @SerializedName("content") val content: String,
    @SerializedName("attachments") val attachments: Map<String, Any>?,
    @SerializedName("status") val status: String, // "sent", "after_hours_deferred", "blocked"
    @SerializedName("read") val read: Boolean,
    @SerializedName("read_at") val readAt: String?,
    @SerializedName("created_at") val createdAt: String,
    // Deferred message fields
    @SerializedName("next_open_at") val nextOpenAt: String? = null,
    // Blocked message fields
    @SerializedName("action") val action: String? = null, // "redirect_emergency", etc.
    @SerializedName("reason") val reason: String? = null,
    @SerializedName("message") val message: String? = null
)

data class MessageThread(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("clinic_id") val clinicId: String?,
    @SerializedName("subject") val subject: String?,
    @SerializedName("last_message_at") val lastMessageAt: String?,
    @SerializedName("created_at") val createdAt: String
)

// ==================== Medications ====================

data class RefillRequestRequest(
    @SerializedName("medication_id") val medicationId: String
)

data class RefillRequestResponse(
    @SerializedName("id") val id: String,
    @SerializedName("medication_id") val medicationId: String,
    @SerializedName("status") val status: String, // "approved", "blocked", "pending"
    @SerializedName("reason") val reason: String? = null,
    @SerializedName("required_labs") val requiredLabs: List<String>? = null,
    @SerializedName("created_at") val createdAt: String
)

data class Medication(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("dosage") val dosage: String?,
    @SerializedName("frequency") val frequency: String?,
    @SerializedName("refills_remaining") val refillsRemaining: Int?,
    @SerializedName("last_filled") val lastFilled: String?
)

// ==================== Measurements ====================

data class RecordMeasurementRequest(
    @SerializedName("type") val type: String, // "blood_pressure", "weight", "glucose", etc.
    @SerializedName("value") val value: Map<String, Any>,
    @SerializedName("source") val source: String = "manual",
    @SerializedName("metadata") val metadata: Map<String, Any>? = null
)

data class MeasurementResponse(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("type") val type: String,
    @SerializedName("value") val value: Map<String, Any>,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("source") val source: String,
    @SerializedName("urgency") val urgency: String? = null, // "green", "yellow", "red"
    @SerializedName("escalated") val escalated: Boolean = false,
    @SerializedName("created_at") val createdAt: String
)

// ==================== Appointments ====================

data class AppointmentRequestRequest(
    @SerializedName("type") val type: String,
    @SerializedName("preferred_date") val preferredDate: String? = null,
    @SerializedName("preferred_time") val preferredTime: String? = null,
    @SerializedName("reason") val reason: String? = null,
    @SerializedName("urgency") val urgency: String? = null // "routine", "urgent"
)

data class AppointmentRequestResponse(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String,
    @SerializedName("status") val status: String, // "pending", "approved", "scheduled"
    @SerializedName("requested_at") val requestedAt: String
)

// ==================== Error Responses ====================

data class ApiError(
    @SerializedName("error") val error: String,
    @SerializedName("message") val message: String,
    @SerializedName("code") val code: String? = null,
    @SerializedName("retry_after") val retryAfter: Int? = null // For 429 rate limit
)
