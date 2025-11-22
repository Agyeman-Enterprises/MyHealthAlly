package com.myhealthally.app.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.myhealthally.app.health.HealthConnectManager
import java.time.Instant
import java.time.temporal.ChronoUnit

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val healthManager = HealthConnectManager(applicationContext)
            val endTime = Instant.now()
            val startTime = endTime.minus(7, ChronoUnit.DAYS)

            // Sync health data
            val steps = healthManager.readSteps(startTime, endTime)
            val bp = healthManager.readBloodPressure(startTime, endTime)
            val glucose = healthManager.readGlucose(startTime, endTime)
            val weight = healthManager.readWeight(startTime, endTime)

            // TODO: Send to backend API

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

