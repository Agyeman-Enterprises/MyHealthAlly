package com.agyeman.myhealthally.core.audit

import android.content.Context
import androidx.room.*
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import androidx.room.ColumnInfo
import com.agyeman.myhealthally.core.config.AppConfig
import com.agyeman.myhealthally.core.logging.Logger
import kotlinx.coroutines.flow.Flow
import java.util.Date

/**
 * Audit Logging System for HIPAA Compliance
 * 
 * Logs all PHI access, authentication events, and critical operations
 * Provides audit trail for compliance and security monitoring
 */
class AuditLogger(private val context: Context) {
    
    private val database = Room.databaseBuilder(
        context,
        AuditDatabase::class.java,
        "audit_logs.db"
    ).build()
    
    private val dao = database.auditDao()
    
    /**
     * Log PHI access event
     */
    suspend fun logPHIAccess(
        resource: String,
        action: String,
        userId: String? = null,
        patientId: String? = null,
        details: Map<String, String>? = null
    ) {
        if (!AppConfig.Audit.LOG_PHI_ACCESS) return
        
        val event = AuditEvent(
            id = null,
            eventType = AuditEventType.PHI_ACCESS,
            resource = resource,
            action = action,
            userId = userId,
            patientId = patientId,
            details = details,
            timestamp = Date(),
            ipAddress = null, // Could be added if available
            userAgent = null
        )
        
        dao.insert(event)
        Logger.logPHIAccess(resource, action, userId)
    }
    
    /**
     * Log authentication event
     */
    suspend fun logAuthEvent(
        action: String,
        userId: String? = null,
        success: Boolean,
        error: String? = null
    ) {
        if (!AppConfig.Audit.LOG_AUTH_EVENTS) return
        
        val event = AuditEvent(
            id = null,
            eventType = AuditEventType.AUTHENTICATION,
            resource = "auth",
            action = action,
            userId = userId,
            patientId = null,
            details = mapOf(
                "success" to success.toString(),
                "error" to (error ?: "")
            ),
            timestamp = Date(),
            ipAddress = null,
            userAgent = null
        )
        
        dao.insert(event)
        Logger.logAuthEvent(action, success, if (error != null) Exception(error) else null)
    }
    
    /**
     * Log API call
     */
    suspend fun logApiCall(
        endpoint: String,
        method: String,
        statusCode: Int,
        userId: String? = null,
        durationMs: Long? = null
    ) {
        if (!AppConfig.Audit.LOG_API_CALLS) return
        
        val event = AuditEvent(
            id = null,
            eventType = AuditEventType.API_CALL,
            resource = endpoint,
            action = method,
            userId = userId,
            patientId = null,
            details = mapOf(
                "status_code" to statusCode.toString(),
                "duration_ms" to (durationMs?.toString() ?: "")
            ),
            timestamp = Date(),
            ipAddress = null,
            userAgent = null
        )
        
        dao.insert(event)
    }
    
    /**
     * Get audit events for a patient
     */
    fun getPatientAuditEvents(patientId: String, limit: Int = 100): Flow<List<AuditEvent>> {
        return dao.getEventsByPatient(patientId, limit)
    }
    
    /**
     * Get audit events for a user
     */
    fun getUserAuditEvents(userId: String, limit: Int = 100): Flow<List<AuditEvent>> {
        return dao.getEventsByUser(userId, limit)
    }
    
    /**
     * Clean up old audit logs (older than max age)
     */
    suspend fun cleanupOldLogs() {
        val maxAge = AppConfig.Audit.MAX_LOG_AGE_DAYS
        val cutoffDate = Date(System.currentTimeMillis() - (maxAge * 24 * 60 * 60 * 1000))
        dao.deleteOlderThan(cutoffDate)
    }
}

/**
 * Audit event types
 */
enum class AuditEventType {
    PHI_ACCESS,
    AUTHENTICATION,
    API_CALL,
    SECURITY_EVENT,
    DATA_MODIFICATION
}

/**
 * Audit event entity
 */
@Entity(tableName = "audit_events")
data class AuditEvent(
    @PrimaryKey(autoGenerate = true)
    val id: Long? = null,
    @ColumnInfo(name = "event_type")
    val eventType: AuditEventType,
    @ColumnInfo(name = "resource")
    val resource: String,
    @ColumnInfo(name = "action")
    val action: String,
    @ColumnInfo(name = "user_id")
    val userId: String?,
    @ColumnInfo(name = "patient_id")
    val patientId: String?,
    @ColumnInfo(name = "details")
    val details: Map<String, String>?,
    @ColumnInfo(name = "timestamp")
    val timestamp: Date,
    @ColumnInfo(name = "ip_address")
    val ipAddress: String?,
    @ColumnInfo(name = "user_agent")
    val userAgent: String?
)

/**
 * Type converters for Room
 */
class Converters {
    @TypeConverter
    fun fromEventType(value: AuditEventType): String = value.name
    
    @TypeConverter
    fun toEventType(value: String): AuditEventType = AuditEventType.valueOf(value)
    
    @TypeConverter
    fun fromTimestamp(value: Date): Long = value.time
    
    @TypeConverter
    fun toTimestamp(value: Long): Date = Date(value)
    
    @TypeConverter
    fun fromStringMap(value: Map<String, String>?): String? {
        return value?.entries?.joinToString(separator = "|") { "${it.key}=${it.value}" }
    }
    
    @TypeConverter
    fun toStringMap(value: String?): Map<String, String>? {
        return value?.split("|")?.associate {
            val (key, v) = it.split("=", limit = 2)
            key to v
        }
    }
}

/**
 * Audit database
 */
@Database(entities = [AuditEvent::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AuditDatabase : RoomDatabase() {
    abstract fun auditDao(): AuditDao
}

/**
 * Audit DAO
 */
@Dao
interface AuditDao {
    @Insert
    suspend fun insert(event: AuditEvent)
    
    @Query("SELECT * FROM audit_events WHERE patient_id = :patientId ORDER BY timestamp DESC LIMIT :limit")
    fun getEventsByPatient(patientId: String, limit: Int): Flow<List<AuditEvent>>
    
    @Query("SELECT * FROM audit_events WHERE user_id = :userId ORDER BY timestamp DESC LIMIT :limit")
    fun getEventsByUser(userId: String, limit: Int): Flow<List<AuditEvent>>
    
    @Query("DELETE FROM audit_events WHERE timestamp < :cutoffDate")
    suspend fun deleteOlderThan(cutoffDate: Date)
}
