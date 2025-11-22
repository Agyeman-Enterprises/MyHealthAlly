package com.myhealthally.app.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
import java.time.ZonedDateTime

class HealthConnectManager(private val context: Context) {
    private val healthConnectClient: HealthConnectClient? = HealthConnectClient.getOrCreate(context)

    suspend fun requestPermissions(): Set<String> {
        val permissions = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(HeartRateRecord::class),
            HealthPermission.getReadPermission(BloodPressureRecord::class),
            HealthPermission.getReadPermission(BloodGlucoseRecord::class),
            HealthPermission.getReadPermission(WeightRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
        )
        // TODO: Request permissions
        return emptySet()
    }

    suspend fun readSteps(startTime: Instant, endTime: Instant): List<StepsRecord> {
        return healthConnectClient?.readRecords(
            ReadRecordsRequest(
                StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
        )?.records ?: emptyList()
    }

    suspend fun readBloodPressure(startTime: Instant, endTime: Instant): List<BloodPressureRecord> {
        return healthConnectClient?.readRecords(
            ReadRecordsRequest(
                BloodPressureRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
        )?.records ?: emptyList()
    }

    suspend fun readGlucose(startTime: Instant, endTime: Instant): List<BloodGlucoseRecord> {
        return healthConnectClient?.readRecords(
            ReadRecordsRequest(
                BloodGlucoseRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
        )?.records ?: emptyList()
    }

    suspend fun readWeight(startTime: Instant, endTime: Instant): List<WeightRecord> {
        return healthConnectClient?.readRecords(
            ReadRecordsRequest(
                WeightRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
        )?.records ?: emptyList()
    }
}

