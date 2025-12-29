package com.agyeman.myhealthally.data.repositories

import android.content.Context
import com.agyeman.myhealthally.data.api.SupabaseConfig
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

    /**
     * Get all messages in a thread
     */
    suspend fun getThreadMessages(threadId: String): Result<List<SupabaseMessage>> = 
        withContext(Dispatchers.IO) {
            try {
                val messages = supabase.from("messages")
                    .select {
                        filter {
                            eq("thread_id", threadId)
                        }
                        order("created_at", ascending = true)
                    }
                    .decodeList<SupabaseMessage>()
                
                Result.success(messages)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get patient's message threads
     */
    suspend fun getPatientThreads(patientId: String): Result<List<SupabaseMessageThread>> = 
        withContext(Dispatchers.IO) {
            try {
                val threads = supabase.from("message_threads")
                    .select {
                        filter {
                            eq("patient_id", patientId)
                        }
                        order("last_message_at", ascending = false)
                    }
                    .decodeList<SupabaseMessageThread>()
                
                Result.success(threads)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get a single message by ID
     */
    suspend fun getMessage(messageId: String): Result<SupabaseMessage> = 
        withContext(Dispatchers.IO) {
            try {
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
     * Note: attachments contains audio info like: {"audio_url": "...", "duration": 45, "format": "m4a"}
     */
    suspend fun sendVoiceMessage(
        threadId: String,
        senderId: String,  // User ID of sender
        audioFile: File,
        durationSeconds: Int,
        transcript: String? = null
    ): Result<SupabaseMessage> = withContext(Dispatchers.IO) {
        try {
            // First, upload the audio file
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

            // Create message record
            val messageData = mapOf(
                "thread_id" to threadId,
                "sender_id" to senderId,
                "content" to (transcript ?: "Voice message"),
                "attachments" to attachments,
                "read" to false
            )

            val message = supabase.from("messages")
                .insert(messageData)
                .decodeSingle<SupabaseMessage>()

            // Update thread's last_message_at
            supabase.from("message_threads")
                .update(mapOf("last_message_at" to System.currentTimeMillis())) {
                    filter {
                        eq("id", threadId)
                    }
                }

            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Send a text message
     */
    suspend fun sendTextMessage(
        threadId: String,
        senderId: String,
        messageText: String
    ): Result<SupabaseMessage> = withContext(Dispatchers.IO) {
        try {
            val messageData = mapOf(
                "thread_id" to threadId,
                "sender_id" to senderId,
                "content" to messageText,
                "read" to false
            )

            val message = supabase.from("messages")
                .insert(messageData)
                .decodeSingle<SupabaseMessage>()

            // Update thread's last_message_at
            supabase.from("message_threads")
                .update(mapOf("last_message_at" to System.currentTimeMillis())) {
                    filter {
                        eq("id", threadId)
                    }
                }

            Result.success(message)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Mark message as read
     */
    suspend fun markAsRead(messageId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            supabase.from("messages")
                .update(
                    mapOf(
                        "read" to true,
                        "read_at" to System.currentTimeMillis()
                    )
                ) {
                    filter {
                        eq("id", messageId)
                    }
                }
            
            Result.success(Unit)
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
