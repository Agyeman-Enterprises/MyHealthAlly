package com.ohimaa.linala.managers

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.ohimaa.linala.MainActivity
import com.ohimaa.linala.R
import com.ohimaa.linala.ui.theme.BrandConfig

/**
 * Firebase Cloud Messaging Service
 * Handles push notifications for voice messages, triage updates, care plans, etc.
 */
class LinalaMessagingService : FirebaseMessagingService() {
    
    companion object {
        private const val CHANNEL_ID_VOICE_MESSAGES = "voice_messages"
        private const val CHANNEL_ID_CARE_TEAM = "care_team"
        private const val CHANNEL_ID_MEDICATIONS = "medications"
        private const val CHANNEL_ID_APPOINTMENTS = "appointments"
        
        const val ACTION_VOICE_MESSAGE_PROCESSED = "voice_message_processed"
        const val ACTION_TRIAGE_UPDATE = "triage_update"
        const val ACTION_CARE_TEAM_RESPONSE = "care_team_response"
        const val ACTION_CARE_PLAN_UPDATE = "care_plan_update"
        const val ACTION_MEDICATION_REMINDER = "medication_reminder"
        const val ACTION_APPOINTMENT_REMINDER = "appointment_reminder"
    }
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        sendTokenToServer(token)
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Get notification type from data payload
        val data = remoteMessage.data
        val notificationType = data["type"] ?: return
        
        when (notificationType) {
            ACTION_VOICE_MESSAGE_PROCESSED -> handleVoiceMessageProcessed(data)
            ACTION_TRIAGE_UPDATE -> handleTriageUpdate(data)
            ACTION_CARE_TEAM_RESPONSE -> handleCareTeamResponse(data)
            ACTION_CARE_PLAN_UPDATE -> handleCarePlanUpdate(data)
            ACTION_MEDICATION_REMINDER -> handleMedicationReminder(data)
            ACTION_APPOINTMENT_REMINDER -> handleAppointmentReminder(data)
            else -> {
                // Fallback to standard notification
                remoteMessage.notification?.let { notification ->
                    showNotification(
                        title = notification.title ?: BrandConfig.appName,
                        body = notification.body ?: "",
                        channelId = CHANNEL_ID_CARE_TEAM,
                        deepLink = data["deepLink"]
                    )
                }
            }
        }
    }
    
    private fun handleVoiceMessageProcessed(data: Map<String, String>) {
        val messageId = data["messageId"] ?: return
        val triageLevel = data["triageLevel"] ?: "routine"
        val title = data["title"] ?: "Voice Message Processed"
        val body = data["body"] ?: "Your care team has reviewed your message"
        
        showNotification(
            title = title,
            body = body,
            channelId = CHANNEL_ID_VOICE_MESSAGES,
            deepLink = "${BrandConfig.appName.lowercase()}://voice-message/$messageId",
            priority = getTriagePriority(triageLevel)
        )
    }
    
    private fun handleTriageUpdate(data: Map<String, String>) {
        val messageId = data["messageId"] ?: return
        val triageLevel = data["triageLevel"] ?: "routine"
        val title = "Health Update: ${triageLevel.replaceFirstChar { it.uppercase() }}"
        val body = data["body"] ?: "Your care team has an update for you"
        
        showNotification(
            title = title,
            body = body,
            channelId = CHANNEL_ID_CARE_TEAM,
            deepLink = "${BrandConfig.appName.lowercase()}://voice-message/$messageId",
            priority = getTriagePriority(triageLevel)
        )
    }
    
    private fun handleCareTeamResponse(data: Map<String, String>) {
        val messageId = data["messageId"] ?: return
        val responderName = data["responderName"] ?: "Your Care Team"
        val body = data["body"] ?: "You have a new message"
        
        showNotification(
            title = "Response from $responderName",
            body = body,
            channelId = CHANNEL_ID_CARE_TEAM,
            deepLink = "${BrandConfig.appName.lowercase()}://voice-message/$messageId"
        )
    }
    
    private fun handleCarePlanUpdate(data: Map<String, String>) {
        val carePlanId = data["carePlanId"] ?: return
        val title = data["title"] ?: "Care Plan Updated"
        val body = data["body"] ?: "Your care plan has been updated"
        
        showNotification(
            title = title,
            body = body,
            channelId = CHANNEL_ID_CARE_TEAM,
            deepLink = "${BrandConfig.appName.lowercase()}://care-plan/$carePlanId"
        )
    }
    
    private fun handleMedicationReminder(data: Map<String, String>) {
        val medicationId = data["medicationId"] ?: return
        val medicationName = data["medicationName"] ?: "your medication"
        
        showNotification(
            title = "Medication Reminder",
            body = "Time to take $medicationName",
            channelId = CHANNEL_ID_MEDICATIONS,
            deepLink = "${BrandConfig.appName.lowercase()}://medications",
            actions = listOf(
                NotificationAction("Take", "take_medication_$medicationId"),
                NotificationAction("Snooze", "snooze_medication_$medicationId")
            )
        )
    }
    
    private fun handleAppointmentReminder(data: Map<String, String>) {
        val appointmentId = data["appointmentId"] ?: return
        val title = data["title"] ?: "Appointment Reminder"
        val body = data["body"] ?: "You have an upcoming appointment"
        
        showNotification(
            title = title,
            body = body,
            channelId = CHANNEL_ID_APPOINTMENTS,
            deepLink = "${BrandConfig.appName.lowercase()}://appointments"
        )
    }
    
    private fun showNotification(
        title: String,
        body: String,
        channelId: String,
        deepLink: String? = null,
        priority: Int = NotificationCompat.PRIORITY_DEFAULT,
        actions: List<NotificationAction> = emptyList()
    ) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create intent for notification tap
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            deepLink?.let { putExtra("deepLink", it) }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification) // You'll need to create this
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(priority)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
        
        // Add actions
        actions.forEach { action ->
            val actionIntent = Intent(this, NotificationActionReceiver::class.java).apply {
                putExtra("action", action.actionId)
            }
            val actionPendingIntent = PendingIntent.getBroadcast(
                this,
                action.actionId.hashCode(),
                actionIntent,
                PendingIntent.FLAG_IMMUTABLE
            )
            builder.addAction(0, action.label, actionPendingIntent)
        }
        
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_ID_VOICE_MESSAGES,
                    "Voice Messages",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Updates about your voice messages"
                },
                NotificationChannel(
                    CHANNEL_ID_CARE_TEAM,
                    "Care Team",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Messages from your care team"
                },
                NotificationChannel(
                    CHANNEL_ID_MEDICATIONS,
                    "Medication Reminders",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Reminders to take your medications"
                },
                NotificationChannel(
                    CHANNEL_ID_APPOINTMENTS,
                    "Appointments",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Appointment reminders and updates"
                }
            )
            
            channels.forEach { notificationManager.createNotificationChannel(it) }
        }
    }
    
    private fun getTriagePriority(triageLevel: String): Int {
        return when (triageLevel.lowercase()) {
            "emergency" -> NotificationCompat.PRIORITY_MAX
            "urgent" -> NotificationCompat.PRIORITY_HIGH
            "priority" -> NotificationCompat.PRIORITY_HIGH
            else -> NotificationCompat.PRIORITY_DEFAULT
        }
    }
    
    private fun sendTokenToServer(token: String) {
        // TODO: Send token to backend via API
        // ApiService.registerDeviceToken(token, "android")
    }
    
    private data class NotificationAction(
        val label: String,
        val actionId: String
    )
}

/**
 * Broadcast receiver for notification actions
 */
class NotificationActionReceiver : android.content.BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        val action = intent?.getStringExtra("action") ?: return
        
        when {
            action.startsWith("take_medication_") -> {
                // TODO: Mark medication as taken
            }
            action.startsWith("snooze_medication_") -> {
                // TODO: Snooze medication reminder
            }
        }
    }
}
