package com.ohimaa.linala.data.models

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Voice Message Preview (for list view)
 */
data class VoiceMessagePreview(
    val id: String,
    val createdAt: Instant,
    val transcriptPreview: String,
    val hasAISummary: Boolean,
    val isRead: Boolean,
    val durationSeconds: Int,
    val languageCode: String = "en"
) {
    val formattedDate: String
        get() = DateTimeFormatter.ofPattern("MMM d, h:mm a")
            .withZone(ZoneId.systemDefault())
            .format(createdAt)
    
    val formattedDuration: String
        get() {
            val minutes = durationSeconds / 60
            val seconds = durationSeconds % 60
            return String.format("%d:%02d", minutes, seconds)
        }
}

/**
 * Voice Message Detail (full info)
 */
data class VoiceMessageDetail(
    val id: String,
    val createdAt: Instant,
    val transcript: String,
    val englishTranscript: String? = null,
    val patientLanguage: String,
    val aiSummary: String? = null,
    val aiTriageLevel: TriageLevel = TriageLevel.ROUTINE,
    val hasAudioAvailableToPatient: Boolean = false,
    val durationSeconds: Int,
    val isRead: Boolean,
    val careTeamResponse: CareTeamResponse? = null,
    val relatedCarePlan: CarePlanReference? = null
) {
    val hasMultipleLanguages: Boolean
        get() = patientLanguage != "en" && englishTranscript != null
}

/**
 * Triage Level
 */
enum class TriageLevel(
    val displayName: String,
    val colorHex: Long,
    val iconName: String
) {
    ROUTINE("Routine", 0xFF10B981, "check_circle"),
    PRIORITY("Priority", 0xFFF59E0B, "priority_high"),
    URGENT("Urgent", 0xFFEF4444, "warning"),
    EMERGENCY("Emergency", 0xFF7F1D1D, "emergency")
}

/**
 * Care Team Response
 */
data class CareTeamResponse(
    val respondedBy: String,
    val respondedAt: Instant,
    val message: String,
    val actionItems: List<String> = emptyList()
) {
    val formattedDate: String
        get() = DateTimeFormatter.ofPattern("MMM d, h:mm a")
            .withZone(ZoneId.systemDefault())
            .format(respondedAt)
}

/**
 * Care Plan Reference
 */
data class CarePlanReference(
    val id: String,
    val title: String
)

/**
 * Audio URL Response
 */
data class AudioURLResponse(
    val url: String,
    val expiresAt: Instant
)

/**
 * Submit Voice Message Request
 */
data class VoiceMessageSubmitRequest(
    val audioData: ByteArray,
    val audioFormat: String = "m4a",
    val durationSeconds: Int,
    val patientLanguage: String = "en"
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as VoiceMessageSubmitRequest
        return audioData.contentEquals(other.audioData) &&
                audioFormat == other.audioFormat &&
                durationSeconds == other.durationSeconds &&
                patientLanguage == other.patientLanguage
    }

    override fun hashCode(): Int {
        var result = audioData.contentHashCode()
        result = 31 * result + audioFormat.hashCode()
        result = 31 * result + durationSeconds
        result = 31 * result + patientLanguage.hashCode()
        return result
    }
}

/**
 * Submit Voice Message Response
 */
data class VoiceMessageSubmitResponse(
    val messageId: String,
    val status: String,
    val estimatedResponseTime: String? = null
)

/**
 * Care Plan Model
 */
data class CarePlan(
    val id: String,
    val title: String,
    val status: CarePlanStatus,
    val provider: Provider,
    val startDate: Instant,
    val lastUpdated: Instant,
    val goals: List<Goal> = emptyList(),
    val medications: List<Medication> = emptyList(),
    val appointments: List<Appointment> = emptyList(),
    val instructions: List<Instruction> = emptyList(),
    val vitalTargets: List<VitalTarget> = emptyList()
)

enum class CarePlanStatus {
    ACTIVE, COMPLETED, ON_HOLD, CANCELLED
}

data class Provider(
    val name: String,
    val title: String,
    val specialty: String? = null
)

data class Goal(
    val id: String,
    val title: String,
    val description: String,
    val targetDate: Instant? = null,
    val progress: Float = 0f,
    val status: GoalStatus = GoalStatus.IN_PROGRESS
)

enum class GoalStatus {
    NOT_STARTED, IN_PROGRESS, ACHIEVED, NOT_ACHIEVED
}

data class Medication(
    val id: String,
    val name: String,
    val dosage: String,
    val frequency: String,
    val instructions: String? = null,
    val isActive: Boolean = true
)

data class Appointment(
    val id: String,
    val title: String,
    val providerName: String,
    val scheduledDate: Instant,
    val location: String? = null,
    val type: AppointmentType = AppointmentType.IN_PERSON,
    val notes: String? = null
) {
    val formattedDate: String
        get() = DateTimeFormatter.ofPattern("EEEE, MMM d 'at' h:mm a")
            .withZone(ZoneId.systemDefault())
            .format(scheduledDate)
}

enum class AppointmentType {
    IN_PERSON, TELEHEALTH, PHONE, LAB
}

data class Instruction(
    val id: String,
    val category: InstructionCategory,
    val title: String,
    val details: String,
    val priority: InstructionPriority = InstructionPriority.MEDIUM
)

enum class InstructionCategory {
    DIET, EXERCISE, LIFESTYLE, MONITORING, PRECAUTION, OTHER
}

enum class InstructionPriority {
    LOW, MEDIUM, HIGH
}

data class VitalTarget(
    val vitalType: String,
    val targetMin: Double? = null,
    val targetMax: Double? = null,
    val unit: String,
    val notes: String? = null
)
