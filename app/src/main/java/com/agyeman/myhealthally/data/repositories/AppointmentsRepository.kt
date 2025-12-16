package com.agyeman.myhealthally.data.repositories

import android.content.Context
import com.agyeman.myhealthally.data.api.SoloPracticeApiClient
import com.agyeman.myhealthally.data.models.solopractice.AppointmentRequestRequest
import com.agyeman.myhealthally.data.models.solopractice.AppointmentRequestResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AppointmentsRepository(private val context: Context) {
    
    private val apiClient = SoloPracticeApiClient(context)
    
    /**
     * Request an appointment
     * Uses Solopractice API to ensure R1 (Practice Hours) and R4 (Urgency Classification) are enforced
     */
    suspend fun requestAppointment(
        type: String,
        preferredDate: String? = null,
        preferredTime: String? = null,
        reason: String? = null,
        urgency: String? = null
    ): Result<AppointmentRequestResponse> = withContext(Dispatchers.IO) {
        try {
            val request = AppointmentRequestRequest(
                type = type,
                preferredDate = preferredDate,
                preferredTime = preferredTime,
                reason = reason,
                urgency = urgency
            )
            apiClient.requestAppointment(request)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
