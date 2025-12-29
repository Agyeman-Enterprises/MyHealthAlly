package com.agyeman.myhealthally.data.models

import com.google.gson.annotations.SerializedName

data class Task(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("type") val type: TaskType,
    @SerializedName("dueDate") val dueDate: String?,
    @SerializedName("completed") val completed: Boolean,
    @SerializedName("completedAt") val completedAt: String?,
    @SerializedName("priority") val priority: TaskPriority,
    @SerializedName("createdAt") val createdAt: String
)

enum class TaskType {
    @SerializedName("medication") MEDICATION,
    @SerializedName("vital") VITAL,
    @SerializedName("appointment") APPOINTMENT,
    @SerializedName("exercise") EXERCISE,
    @SerializedName("nutrition") NUTRITION,
    @SerializedName("general") GENERAL
}

enum class TaskPriority {
    @SerializedName("low") LOW,
    @SerializedName("medium") MEDIUM,
    @SerializedName("high") HIGH,
    @SerializedName("urgent") URGENT
}
