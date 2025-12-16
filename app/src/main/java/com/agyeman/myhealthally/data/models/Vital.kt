package com.agyeman.myhealthally.data.models

import com.google.gson.annotations.SerializedName

data class Vital(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: VitalType,
    @SerializedName("value") val value: Double,
    @SerializedName("unit") val unit: String,
    @SerializedName("secondaryValue") val secondaryValue: Double? = null,
    @SerializedName("recordedAt") val recordedAt: String,
    @SerializedName("source") val source: VitalSource
)

enum class VitalType {
    @SerializedName("blood_pressure") BLOOD_PRESSURE,
    @SerializedName("heart_rate") HEART_RATE,
    @SerializedName("weight") WEIGHT,
    @SerializedName("glucose") GLUCOSE,
    @SerializedName("temperature") TEMPERATURE,
    @SerializedName("oxygen_saturation") OXYGEN_SATURATION,
    @SerializedName("steps") STEPS,
    @SerializedName("sleep") SLEEP
}

enum class VitalSource {
    @SerializedName("manual") MANUAL,
    @SerializedName("device") DEVICE,
    @SerializedName("healthkit") HEALTHKIT
}

data class VitalReading(
    val type: VitalType,
    val value: String,
    val unit: String,
    val timestamp: String,
    val isNormal: Boolean = true
)
