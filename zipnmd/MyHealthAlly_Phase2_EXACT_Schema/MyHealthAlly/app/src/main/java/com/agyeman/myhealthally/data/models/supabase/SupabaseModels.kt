package com.agyeman.myhealthally.data.models.supabase

import com.google.gson.annotations.SerializedName

/**
 * Supabase Database Models
 * EXACT match to your actual database schema
 * Generated from schema export on Nov 25, 2024
 */

// Users table
data class SupabaseUser(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("password_hash") val passwordHash: String,
    @SerializedName("role") val role: String, // "patient", "provider", "admin"
    @SerializedName("clinic_id") val clinicId: String?,
    @SerializedName("patient_id") val patientId: String?,
    @SerializedName("provider_id") val providerId: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Patients table
data class SupabasePatient(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("clinic_id") val clinicId: String,
    @SerializedName("first_name") val firstName: String?,
    @SerializedName("last_name") val lastName: String?,
    @SerializedName("date_of_birth") val dateOfBirth: String?,
    @SerializedName("demographics") val demographics: Map<String, Any>?, // jsonb field
    @SerializedName("flags") val flags: List<String>?, // array field
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Providers table
data class SupabaseProvider(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("clinic_id") val clinicId: String,
    @SerializedName("first_name") val firstName: String?,
    @SerializedName("last_name") val lastName: String?,
    @SerializedName("specialty") val specialty: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Messages table
data class SupabaseMessage(
    @SerializedName("id") val id: String,
    @SerializedName("thread_id") val threadId: String,
    @SerializedName("sender_id") val senderId: String, // User ID of sender
    @SerializedName("content") val content: String, // Text content or transcript
    @SerializedName("attachments") val attachments: Map<String, Any>?, // jsonb - contains audio_url, etc.
    @SerializedName("read") val read: Boolean,
    @SerializedName("read_at") val readAt: String?,
    @SerializedName("created_at") val createdAt: String
)

// Message threads table
data class SupabaseMessageThread(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("clinic_id") val clinicId: String?,
    @SerializedName("participants") val participants: Map<String, Any>, // jsonb - array of user IDs
    @SerializedName("subject") val subject: String?,
    @SerializedName("last_message_at") val lastMessageAt: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Measurements table (vitals)
data class SupabaseMeasurement(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("type") val type: String, // "blood_pressure", "weight", "glucose", etc.
    @SerializedName("value") val value: Map<String, Any>, // jsonb - e.g., {"systolic": 120, "diastolic": 80}
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("source") val source: String, // "manual", "device", "healthkit"
    @SerializedName("metadata") val metadata: Map<String, Any>?,
    @SerializedName("created_at") val createdAt: String
)

// Visit requests table (appointments)
data class SupabaseVisitRequest(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("type") val type: String, // visit type
    @SerializedName("status") val status: String, // "PENDING", "APPROVED", "SCHEDULED", etc.
    @SerializedName("requested_at") val requestedAt: String
)

// Care plans table
data class SupabaseCarePlan(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("phases") val phases: Map<String, Any>, // jsonb - care plan phases
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Alerts table
data class SupabaseAlert(
    @SerializedName("id") val id: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("severity") val severity: String, // severity level
    @SerializedName("type") val type: String, // alert type
    @SerializedName("title") val title: String,
    @SerializedName("body") val body: String,
    @SerializedName("payload") val payload: Map<String, Any>?, // jsonb - additional data
    @SerializedName("status") val status: String, // "ACTIVE", "RESOLVED"
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("resolved_at") val resolvedAt: String?
)

// Clinics table
data class SupabaseClinic(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("branding_config") val brandingConfig: Map<String, Any>?, // jsonb
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Clinical rules table
data class SupabaseClinicalRule(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String?,
    @SerializedName("metric") val metric: String,
    @SerializedName("windowDays") val windowDays: Int,
    @SerializedName("condition") val condition: Map<String, Any>, // jsonb
    @SerializedName("severity") val severity: String,
    @SerializedName("action") val action: String,
    @SerializedName("actionParams") val actionParams: Map<String, Any>?, // jsonb
    @SerializedName("enabled") val enabled: Boolean,
    @SerializedName("priority") val priority: Int,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Rule executions table
data class SupabaseRuleExecution(
    @SerializedName("id") val id: String,
    @SerializedName("rule_id") val ruleId: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("triggered") val triggered: Boolean,
    @SerializedName("result") val result: Map<String, Any>?, // jsonb
    @SerializedName("executed_at") val executedAt: String
)

// Refresh tokens table
data class SupabaseRefreshToken(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("token") val token: String,
    @SerializedName("expires_at") val expiresAt: String,
    @SerializedName("created_at") val createdAt: String
)
