package com.ohimaa.linala.managers

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.os.Build
import androidx.core.content.ContextCompat
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.util.UUID

/**
 * Recording State
 */
sealed class RecordingState {
    object Idle : RecordingState()
    object Recording : RecordingState()
    object Paused : RecordingState()
    object Finished : RecordingState()
    data class Error(val message: String) : RecordingState()
}

/**
 * Audio Recording Manager
 * Handles native audio recording with 60-second limit
 * Supports AAC encoding
 */
class AudioRecordingManager(private val context: Context) {
    
    companion object {
        const val MAX_DURATION_MS = 60_000L // 60 seconds
        const val MAX_DURATION_SECONDS = 60
    }
    
    private var mediaRecorder: MediaRecorder? = null
    private var recordingFile: File? = null
    private var recordingJob: Job? = null
    private var startTime: Long = 0
    
    private val _state = MutableStateFlow<RecordingState>(RecordingState.Idle)
    val state: StateFlow<RecordingState> = _state.asStateFlow()
    
    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()
    
    private val _audioLevel = MutableStateFlow(0f)
    val audioLevel: StateFlow<Float> = _audioLevel.asStateFlow()
    
    private val _hasRecording = MutableStateFlow(false)
    val hasRecording: StateFlow<Boolean> = _hasRecording.asStateFlow()
    
    /**
     * Check if microphone permission is granted
     */
    fun hasPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Start recording
     */
    suspend fun startRecording(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            if (!hasPermission()) {
                _state.value = RecordingState.Error("Microphone permission denied")
                return@withContext Result.failure(SecurityException("Permission denied"))
            }
            
            // Generate unique filename
            val fileName = "voice_message_${UUID.randomUUID()}.m4a"
            recordingFile = File(context.cacheDir, fileName)
            
            // Create and configure MediaRecorder
            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioSamplingRate(44100)
                setAudioEncodingBitRate(128000)
                setOutputFile(recordingFile!!.absolutePath)
                setMaxDuration(MAX_DURATION_MS.toInt())
                
                setOnInfoListener { _, what, _ ->
                    if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) {
                        CoroutineScope(Dispatchers.Main).launch {
                            stopRecording()
                        }
                    }
                }
                
                setOnErrorListener { _, what, extra ->
                    _state.value = RecordingState.Error("Recording error: $what, $extra")
                }
                
                prepare()
                start()
            }
            
            startTime = System.currentTimeMillis()
            _state.value = RecordingState.Recording
            _durationMs.value = 0
            
            // Start timer and level updates
            startUpdates()
            
            Result.success(Unit)
        } catch (e: Exception) {
            _state.value = RecordingState.Error(e.message ?: "Failed to start recording")
            Result.failure(e)
        }
    }
    
    /**
     * Stop recording
     */
    fun stopRecording() {
        recordingJob?.cancel()
        recordingJob = null
        
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            
            if (_durationMs.value > 0) {
                _state.value = RecordingState.Finished
                _hasRecording.value = true
            } else {
                _state.value = RecordingState.Idle
                _hasRecording.value = false
            }
        } catch (e: Exception) {
            _state.value = RecordingState.Error(e.message ?: "Failed to stop recording")
        }
    }
    
    /**
     * Cancel recording and delete file
     */
    fun cancelRecording() {
        recordingJob?.cancel()
        recordingJob = null
        
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
        } catch (_: Exception) {
            // Ignore errors when cancelling
        }
        
        mediaRecorder = null
        deleteRecording()
        
        _state.value = RecordingState.Idle
        _durationMs.value = 0
        _hasRecording.value = false
    }
    
    /**
     * Delete the recorded file
     */
    fun deleteRecording() {
        recordingFile?.delete()
        recordingFile = null
        _hasRecording.value = false
    }
    
    /**
     * Get the recording file
     */
    fun getRecordingFile(): File? = recordingFile
    
    /**
     * Get recording file as ByteArray
     */
    fun getRecordingData(): ByteArray? {
        return recordingFile?.readBytes()
    }
    
    /**
     * Get formatted duration string (M:SS)
     */
    fun getFormattedDuration(): String {
        val seconds = (_durationMs.value / 1000).toInt()
        val minutes = seconds / 60
        val secs = seconds % 60
        return String.format("%d:%02d", minutes, secs)
    }
    
    /**
     * Get formatted remaining time string (M:SS)
     */
    fun getFormattedRemainingTime(): String {
        val remaining = MAX_DURATION_MS - _durationMs.value
        val seconds = (remaining / 1000).toInt()
        val minutes = seconds / 60
        val secs = seconds % 60
        return String.format("%d:%02d", minutes, secs)
    }
    
    /**
     * Get recording progress (0.0 to 1.0)
     */
    fun getProgress(): Float {
        return (_durationMs.value.toFloat() / MAX_DURATION_MS).coerceIn(0f, 1f)
    }
    
    /**
     * Start timer and audio level updates
     */
    private fun startUpdates() {
        recordingJob = CoroutineScope(Dispatchers.Main).launch {
            while (isActive && _state.value == RecordingState.Recording) {
                // Update duration
                _durationMs.value = System.currentTimeMillis() - startTime
                
                // Update audio level
                try {
                    mediaRecorder?.let { recorder ->
                        val amplitude = recorder.maxAmplitude
                        // Normalize to 0-1 range (max amplitude is ~32767)
                        _audioLevel.value = (amplitude / 32767f).coerceIn(0f, 1f)
                    }
                } catch (_: Exception) {
                    // Ignore level errors
                }
                
                // Check max duration
                if (_durationMs.value >= MAX_DURATION_MS) {
                    stopRecording()
                    break
                }
                
                delay(100)
            }
        }
    }
    
    /**
     * Reset state
     */
    fun reset() {
        cancelRecording()
        _state.value = RecordingState.Idle
        _durationMs.value = 0
        _audioLevel.value = 0f
        _hasRecording.value = false
    }
}
