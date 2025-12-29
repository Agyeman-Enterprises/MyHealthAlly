package com.agyeman.myhealthally.data.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("phoneNumber") val phoneNumber: String?,
    @SerializedName("dateOfBirth") val dateOfBirth: String?,
    @SerializedName("avatar") val avatar: String?,
    @SerializedName("preferredLanguage") val preferredLanguage: String = "en",
    @SerializedName("createdAt") val createdAt: String
)

data class Appointment(
    @SerializedName("id") val id: String,
    @SerializedName("providerId") val providerId: String,
    @SerializedName("providerName") val providerName: String,
    @SerializedName("providerRole") val providerRole: String,
    @SerializedName("appointmentType") val appointmentType: String,
    @SerializedName("scheduledAt") val scheduledAt: String,
    @SerializedName("durationMinutes") val durationMinutes: Int,
    @SerializedName("status") val status: AppointmentStatus,
    @SerializedName("notes") val notes: String?,
    @SerializedName("location") val location: String?,
    @SerializedName("isVirtual") val isVirtual: Boolean = false
)

enum class AppointmentStatus {
    @SerializedName("scheduled") SCHEDULED,
    @SerializedName("confirmed") CONFIRMED,
    @SerializedName("completed") COMPLETED,
    @SerializedName("cancelled") CANCELLED,
    @SerializedName("no_show") NO_SHOW
}

data class CarePlan(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("goals") val goals: List<String>,
    @SerializedName("interventions") val interventions: List<String>,
    @SerializedName("startDate") val startDate: String,
    @SerializedName("endDate") val endDate: String?,
    @SerializedName("status") val status: String,
    @SerializedName("createdBy") val createdBy: String,
    @SerializedName("updatedAt") val updatedAt: String
)
