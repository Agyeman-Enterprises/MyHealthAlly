package com.myhealthally.app.data.model

import com.google.gson.annotations.SerializedName

// Auth Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val role: String,
    val clinicId: String? = null,
    val firstName: String? = null,
    val lastName: String? = null
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: User
)

data class User(
    val id: String,
    val email: String,
    val role: String,
    val clinicId: String? = null,
    val patientId: String? = null
)

// Patient Models
data class Patient(
    val id: String,
    val userId: String,
    val clinicId: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val dateOfBirth: String? = null
)

// Measurement Models
data class Measurement(
    val id: String,
    val patientId: String,
    val type: String,
    val value: Any,
    val timestamp: String,
    val source: String
)

data class CreateMeasurementRequest(
    val type: String,
    val value: Any,
    val timestamp: String,
    val source: String
)

// Alert Models
data class Alert(
    val id: String,
    val patientId: String,
    val severity: String,
    val type: String,
    val title: String,
    val body: String,
    val status: String,
    val createdAt: String
)

// Messaging Models
data class MessageThread(
    val id: String,
    val patientId: String,
    val subject: String? = null,
    val lastMessageAt: String? = null
)

data class Message(
    val id: String,
    val threadId: String,
    val senderId: String,
    val content: String,
    val read: Boolean,
    val createdAt: String
)

data class SendMessageRequest(
    val content: String
)

