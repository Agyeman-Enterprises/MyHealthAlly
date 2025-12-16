package com.agyeman.myhealthally.data.api

import com.google.gson.GsonBuilder
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.realtime.Realtime

/**
 * Supabase Configuration
 * 
 * TODO: Replace these with your actual Supabase credentials:
 * 1. Go to Supabase Dashboard → Settings → API
 * 2. Copy your Project URL
 * 3. Copy your anon/public key
 * 4. Update SUPABASE_URL and SUPABASE_KEY below
 */
object SupabaseConfig {
    // TODO: Replace with your Supabase project URL
    const val SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
    
    // TODO: Replace with your Supabase anon key
    const val SUPABASE_KEY = "YOUR_ANON_KEY_HERE"
    
    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_KEY
        ) {
            install(Auth)
            install(Postgrest)
            install(Storage)
            install(Realtime)
        }
    }
}
