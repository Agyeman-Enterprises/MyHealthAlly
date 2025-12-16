package com.agyeman.myhealthally.data.repositories

import android.content.Context
import com.agyeman.myhealthally.data.api.SoloPracticeApiClient
import com.agyeman.myhealthally.data.api.SupabaseConfig
import com.agyeman.myhealthally.data.models.solopractice.SymptomScreenResult
import com.agyeman.myhealthally.data.models.supabase.SupabaseMessage
import com.agyeman.myhealthally.data.models.supabase.SupabaseMessageThread
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.storage.storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID

class MessagesRepository(private val context: Context) {

    private val supabase = SupabaseConfig.client
    private val apiClient = SoloPracticeApiClient(context)

    /**
     * Get all messages in a thread
     * Uses Solopractice API to ensure R10 (Patient Transparency Logging) is enforced
     */
    suspend fun getThreadMessages(threadId: String): Result<List<SupabaseMessage>> = 
        withContext(Dispatchers.IO) {
            try {
                val result = apiClient.getThreadMessages(threadId)
                result.map { apiMessages ->
                    // Convert API response to Supabase model for backward compatibility
                    apiMessages.map { it.toSupabaseMessage() }
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get patient's message threads
     * Uses Solopractice API to ensure R10 (Patient Transparency Logging) is enforced
     * Note: patientId parameter kept for backward compatibility, but API filters by authenticated user
     */
    suspend fun getPatientThreads(patientId: String): Result<List<SupabaseMessageThread>> = 
        withContext(Dispatchers.IO) {
            try {
                val result = apiClient.getThreads()
                result.map { apiThreads ->
                    // Convert API response to Supabase model for backward compatibility
                    apiThreads.map { it.toSupabaseMessageThread() }
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    
    /**
     * Get or create default thread for current patient
     * If no threads exist, creates one via Supabase (threads are auto-created by API on first message)
     */
    suspend fun getOrCreateDefaultThread(patientId: String, practiceId: String?): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                // Try to get existing threads
                val threadsResult = getPatientThreads(patientId)
                val threads = threadsResult.getOrNull()
                
                if (threads != null && threads.isNotEmpty()) {
                    return@withContext Result.success(threads.first().id)
                }
                
                // If no threads exist, create one via Supabase
                // The API will handle thread creation on first message, but we need a thread ID
                // So we create it here as a fallback
                val threadResult = getOrCreateThread(
                    patientId = patientId,
                    clinicId = practiceId ?: "default",
                    participantIds = listOf(patientId),
                    subject = "Main Conversation"
                )
                
                threadResult.map { it.id }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get a single message by ID
     * Note: This method may need to be updated if Solopractice API provides a direct endpoint
     * For now, we'll get it from the thread messages
     */
    suspend fun getMessage(messageId: String): Result<SupabaseMessage> = 
        withContext(Dispatchers.IO) {
            try {
                // First, we need to find which thread this message belongs to
                // This is a limitation - we may need to get all threads and search
                // Or the API may need a direct message endpoint
                // For now, fallback to Supabase (this should be replaced with API endpoint)
                val message = supabase.from("messages")
                    .select {
                        filter {
                            eq("id", messageId)
                        }
                    }
                    .decodeSingle<SupabaseMessage>()
                
                Result.success(message)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Upload voice message audio file to Supabase Storage
     */
    suspend fun uploadAudioFile(audioFile: File, patientId: String): Result<String> = 
        withContext(Dispatchers.IO) {
            try {
                val fileName = "voice_messages/${patientId}/${UUID.randomUUID()}.m4a"
                val bucket = supabase.storage.from("audio-messages")
                
                // Upload file
                bucket.upload(fileName, audioFile.readBytes())
                
                // Get public URL
                val publicUrl = bucket.publicUrl(fileName)
                
                Result.success(publicUrl)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Send a voice message
     * Uses Solopractice API to ensure R1, R2, R3 (Practice Hours, Emergency Intercept, Deferral) are enforced
     * 
     * @param symptomScreen Optional symptom screen data for after-hours messages (R2 enforcement)
     * @return Result with SupabaseMessage (for backward compatibility) or error
     */
    suspend fun sendVoiceMessage(
        threadId: String,
        senderId: String,  // User ID of sender (kept for compatibility, API uses authenticated user)
        audioFile: File,
        durationSeconds: Int,
        transcript: String? = null,
        symptomScreen: SymptomScreenResult? = null
    ): Result<SupabaseMessage> = withContext(Dispatchers.IO) {
        try {
            // First, upload the audio file to Supabase Storage
            // Note: Audio upload could also go through Solopractice API if endpoint exists
            val audioUrlResult = uploadAudioFile(audioFile, senderId)
            if (audioUrlResult.isFailure) {
                return@withContext Result.failure(audioUrlResult.exceptionOrNull()!!)
            }
            val audioUrl = audioUrlResult.getOrThrow()

            // Build attachments object
            val attachments = mapOf(
                "audio_url" to audioUrl,
                "duration_seconds" to durationSeconds,
                "format" to "m4a"
            )

            // Send message through Solopractice API (enforces R1, R2, R3)
            val result = apiClient.sendMessage(
                threadId = threadId,
                body = transcript ?: "Voice message",
                symptomScreen = symptomScreen,
                attachments = attachments
            )

            result.map { apiMessage ->
                // Convert API response to Supabase model for backward compatibility
                apiMessage.toSupabaseMessage()
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Send a voice message and return API response with status information
     * Use this when you need to handle deferred/blocked responses
     */
    suspend fun sendVoiceMessageWithStatus(
        threadId: String,
        senderId: String,
        audioFile: File,
        durationSeconds: Int,
        transcript: String? = null,
        symptomScreen: SymptomScreenResult? = null
    ): Result<com.agyeman.myhealthally.data.models.solopractice.MessageResponse> = withContext(Dispatchers.IO) {
        try {
            // First, upload the audio file to Supabase Storage
            val audioUrlResult = uploadAudioFile(audioFile, senderId)
            if (audioUrlResult.isFailure) {
                return@withContext Result.failure(audioUrlResult.exceptionOrNull()!!)
            }
            val audioUrl = audioUrlResult.getOrThrow()

            // Build attachments object
            val attachments = mapOf(
                "audio_url" to audioUrl,
                "duration_seconds" to durationSeconds,
                "format" to "m4a"
            )

            // Send message through Solopractice API (enforces R1, R2, R3)
            apiClient.sendMessage(
                threadId = threadId,
                body = transcript ?: "Voice message",
                symptomScreen = symptomScreen,
                attachments = attachments
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Send a text message
     * Uses Solopractice API to ensure R1, R2, R3 (Practice Hours, Emergency Intercept, Deferral) are enforced
     * 
     * @param symptomScreen Optional symptom screen data for after-hours messages (R2 enforcement)
     */
    suspend fun sendTextMessage(
        threadId: String,
        senderId: String,  // Kept for compatibility, API uses authenticated user
        messageText: String,
        symptomScreen: SymptomScreenResult? = null
    ): Result<SupabaseMessage> = withContext(Dispatchers.IO) {
        try {
            // Send message through Solopractice API (enforces R1, R2, R3)
            val result = apiClient.sendMessage(
                threadId = threadId,
                body = messageText,
                symptomScreen = symptomScreen,
                attachments = null
            )

            result.map { apiMessage ->
                // Convert API response to Supabase model for backward compatibility
                apiMessage.toSupabaseMessage()
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Mark message as read
     * Uses Solopractice API
     */
    suspend fun markAsRead(messageId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            apiClient.markMessageAsRead(messageId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get unread message count for a patient
     */
    suspend fun getUnreadCount(patientId: String, userId: String): Result<Int> = 
        withContext(Dispatchers.IO) {
            try {
                // Get all threads for this patient
                val threads = supabase.from("message_threads")
                    .select {
                        filter {
                            eq("patient_id", patientId)
                        }
                    }
                    .decodeList<SupabaseMessageThread>()
                
                // Count unread messages in those threads where sender is NOT the user
                var unreadCount = 0
                for (thread in threads) {
                    val messages = supabase.from("messages")
                        .select {
                            filter {
                                eq("thread_id", thread.id)
                                eq("read", false)
                                neq("sender_id", userId) // Not sent by the patient
                            }
                        }
                        .decodeList<SupabaseMessage>()
                    unreadCount += messages.size
                }
                
                Result.success(unreadCount)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get or create a message thread for a patient
     */
    suspend fun getOrCreateThread(
        patientId: String,
        clinicId: String,
        participantIds: List<String>, // List of user IDs (patient + providers)
        subject: String? = null
    ): Result<SupabaseMessageThread> = withContext(Dispatchers.IO) {
        try {
            // Try to find existing thread
            val existingThreads = supabase.from("message_threads")
                .select {
                    filter {
                        eq("patient_id", patientId)
                    }
                }
                .decodeList<SupabaseMessageThread>()

            if (existingThreads.isNotEmpty()) {
                return@withContext Result.success(existingThreads.first())
            }

            // Create new thread with participants as jsonb
            val threadData = mapOf(
                "patient_id" to patientId,
                "clinic_id" to clinicId,
                "participants" to mapOf("user_ids" to participantIds),
                "subject" to (subject ?: "New Conversation")
            )

            val thread = supabase.from("message_threads")
                .insert(threadData)
                .decodeSingle<SupabaseMessageThread>()

            Result.success(thread)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// Extension functions to convert API models to Supabase models for backward compatibility
private fun com.agyeman.myhealthally.data.models.solopractice.MessageResponse.toSupabaseMessage(): SupabaseMessage {
    return SupabaseMessage(
        id = this.id,
        threadId = this.threadId,
        senderId = this.senderId,
        content = this.content,
        attachments = this.attachments,
        read = this.read,
        readAt = this.readAt,
        createdAt = this.createdAt
    )
}

private fun com.agyeman.myhealthally.data.models.solopractice.MessageThread.toSupabaseMessageThread(): SupabaseMessageThread {
    return SupabaseMessageThread(
        id = this.id,
        patientId = this.patientId,
        clinicId = this.clinicId,
        participants = emptyMap(), // API may not return this, or we need to construct it
        subject = this.subject,
        lastMessageAt = this.lastMessageAt,
        createdAt = this.createdAt,
        updatedAt = this.createdAt // Use createdAt as fallback
    )
}
