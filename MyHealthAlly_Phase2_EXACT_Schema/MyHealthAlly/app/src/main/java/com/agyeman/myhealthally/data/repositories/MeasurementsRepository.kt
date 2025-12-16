package com.agyeman.myhealthally.data.repositories

import com.agyeman.myhealthally.data.api.SupabaseConfig
import com.agyeman.myhealthally.data.models.supabase.SupabaseMeasurement
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MeasurementsRepository {

    private val supabase = SupabaseConfig.client

    /**
     * Get all measurements for a patient
     */
    suspend fun getPatientMeasurements(
        patientId: String,
        type: String? = null,
        limit: Int = 100
    ): Result<List<SupabaseMeasurement>> = withContext(Dispatchers.IO) {
        try {
            val measurements = supabase.from("measurements")
                .select {
                    filter {
                        eq("patient_id", patientId)
                        type?.let { eq("type", it) }
                    }
                    order("timestamp", ascending = false)
                    limit(limit.toLong())
                }
                .decodeList<SupabaseMeasurement>()
            
            Result.success(measurements)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Record a measurement
     * Note: value is a jsonb field, so structure it appropriately
     */
    suspend fun recordMeasurement(
        patientId: String,
        type: String,
        value: Map<String, Any>,
        source: String = "manual",
        metadata: Map<String, Any>? = null
    ): Result<SupabaseMeasurement> = withContext(Dispatchers.IO) {
        try {
            val measurementData = mapOf(
                "patient_id" to patientId,
                "type" to type,
                "value" to value,
                "timestamp" to System.currentTimeMillis(),
                "source" to source,
                "metadata" to metadata
            )

            val measurement = supabase.from("measurements")
                .insert(measurementData)
                .decodeSingle<SupabaseMeasurement>()

            Result.success(measurement)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Record blood pressure (convenience method)
     * Value structure: {"systolic": 120, "diastolic": 80, "unit": "mmHg"}
     */
    suspend fun recordBloodPressure(
        patientId: String,
        systolic: Int,
        diastolic: Int,
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "systolic" to systolic,
            "diastolic" to diastolic,
            "unit" to "mmHg"
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "blood_pressure",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Record weight (convenience method)
     * Value structure: {"value": 165.5, "unit": "lbs"}
     */
    suspend fun recordWeight(
        patientId: String,
        weight: Double,
        unit: String = "lbs",
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "value" to weight,
            "unit" to unit
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "weight",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Record glucose (convenience method)
     * Value structure: {"value": 110, "unit": "mg/dL"}
     */
    suspend fun recordGlucose(
        patientId: String,
        glucose: Int,
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "value" to glucose,
            "unit" to "mg/dL"
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "glucose",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Record heart rate (convenience method)
     * Value structure: {"value": 75, "unit": "bpm"}
     */
    suspend fun recordHeartRate(
        patientId: String,
        heartRate: Int,
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "value" to heartRate,
            "unit" to "bpm"
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "heart_rate",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Record temperature (convenience method)
     * Value structure: {"value": 98.6, "unit": "F"}
     */
    suspend fun recordTemperature(
        patientId: String,
        temperature: Double,
        unit: String = "F",
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "value" to temperature,
            "unit" to unit
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "temperature",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Record oxygen saturation (convenience method)
     * Value structure: {"value": 98, "unit": "%"}
     */
    suspend fun recordOxygenSaturation(
        patientId: String,
        oxygenSaturation: Int,
        notes: String? = null
    ): Result<SupabaseMeasurement> {
        val value = mapOf(
            "value" to oxygenSaturation,
            "unit" to "%"
        )
        
        val metadata = notes?.let { mapOf("notes" to it) }
        
        return recordMeasurement(
            patientId = patientId,
            type = "oxygen_saturation",
            value = value,
            metadata = metadata
        )
    }

    /**
     * Get latest measurement of a specific type
     */
    suspend fun getLatestMeasurement(
        patientId: String,
        type: String
    ): Result<SupabaseMeasurement?> = withContext(Dispatchers.IO) {
        try {
            val measurements = supabase.from("measurements")
                .select {
                    filter {
                        eq("patient_id", patientId)
                        eq("type", type)
                    }
                    order("timestamp", ascending = false)
                    limit(1)
                }
                .decodeList<SupabaseMeasurement>()
            
            Result.success(measurements.firstOrNull())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
