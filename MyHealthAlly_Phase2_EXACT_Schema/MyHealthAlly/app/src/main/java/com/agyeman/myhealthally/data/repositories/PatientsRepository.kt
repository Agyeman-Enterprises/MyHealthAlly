package com.agyeman.myhealthally.data.repositories

import com.agyeman.myhealthally.data.api.SupabaseConfig
import com.agyeman.myhealthally.data.models.supabase.SupabasePatient
import com.agyeman.myhealthally.data.models.supabase.SupabaseProvider
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class PatientsRepository {

    private val supabase = SupabaseConfig.client

    /**
     * Get patient profile by user ID
     */
    suspend fun getPatientByUserId(userId: String): Result<SupabasePatient> = 
        withContext(Dispatchers.IO) {
            try {
                val patient = supabase.from("patients")
                    .select {
                        filter {
                            eq("user_id", userId)
                        }
                    }
                    .decodeSingle<SupabasePatient>()
                
                Result.success(patient)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Get patient profile by patient ID
     */
    suspend fun getPatient(patientId: String): Result<SupabasePatient> = 
        withContext(Dispatchers.IO) {
            try {
                val patient = supabase.from("patients")
                    .select {
                        filter {
                            eq("id", patientId)
                        }
                    }
                    .decodeSingle<SupabasePatient>()
                
                Result.success(patient)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Update patient profile
     * Note: demographics is a jsonb field, so it should be a Map
     */
    suspend fun updatePatient(
        patientId: String,
        updates: Map<String, Any>
    ): Result<SupabasePatient> = withContext(Dispatchers.IO) {
        try {
            val patient = supabase.from("patients")
                .update(updates) {
                    filter {
                        eq("id", patientId)
                    }
                }
                .decodeSingle<SupabasePatient>()
            
            Result.success(patient)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update patient demographics
     * Demographics is a jsonb field that can contain:
     * - phone_number
     * - address
     * - emergency_contact
     * - language_preference
     * - etc.
     */
    suspend fun updateDemographics(
        patientId: String,
        demographics: Map<String, Any>
    ): Result<SupabasePatient> = withContext(Dispatchers.IO) {
        try {
            val patient = supabase.from("patients")
                .update(mapOf("demographics" to demographics)) {
                    filter {
                        eq("id", patientId)
                    }
                }
                .decodeSingle<SupabasePatient>()
            
            Result.success(patient)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Add a flag to patient (e.g., "high_risk", "diabetic", "pregnant")
     */
    suspend fun addFlag(
        patientId: String,
        flag: String
    ): Result<SupabasePatient> = withContext(Dispatchers.IO) {
        try {
            // First get current patient
            val currentPatient = getPatient(patientId).getOrThrow()
            val currentFlags = currentPatient.flags?.toMutableList() ?: mutableListOf()
            
            if (!currentFlags.contains(flag)) {
                currentFlags.add(flag)
                
                val patient = supabase.from("patients")
                    .update(mapOf("flags" to currentFlags)) {
                        filter {
                            eq("id", patientId)
                        }
                    }
                    .decodeSingle<SupabasePatient>()
                
                return@withContext Result.success(patient)
            }
            
            Result.success(currentPatient)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get patient's assigned providers (from their clinic)
     */
    suspend fun getPatientProviders(clinicId: String): Result<List<SupabaseProvider>> = 
        withContext(Dispatchers.IO) {
            try {
                val providers = supabase.from("providers")
                    .select {
                        filter {
                            eq("clinic_id", clinicId)
                        }
                    }
                    .decodeList<SupabaseProvider>()
                
                Result.success(providers)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
