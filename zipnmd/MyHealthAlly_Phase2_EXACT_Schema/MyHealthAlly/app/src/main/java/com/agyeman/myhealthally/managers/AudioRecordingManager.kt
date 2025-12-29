package com.agyeman.myhealthally.managers

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.IOException

class AudioRecordingManager(private val context: Context) {

    private var mediaRecorder: MediaRecorder? = null
    private var outputFile: File? = null
    private var startTime: Long = 0

    private val _isRecording = MutableStateFlow(false)
    val isRecording: StateFlow<Boolean> = _isRecording.asStateFlow()

    private val _recordingDuration = MutableStateFlow(0L)
    val recordingDuration: StateFlow<Long> = _recordingDuration.asStateFlow()

    fun startRecording(): Result<File> {
        return try {
            val fileName = "voice_message_${System.currentTimeMillis()}.m4a"
            outputFile = File(context.cacheDir, fileName)

            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(outputFile!!.absolutePath)

                prepare()
                start()
            }

            startTime = System.currentTimeMillis()
            _isRecording.value = true

            Result.success(outputFile!!)
        } catch (e: IOException) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    fun stopRecording(): Result<File> {
        return try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            _isRecording.value = false

            outputFile?.let {
                Result.success(it)
            } ?: Result.failure(Exception("No recording file available"))
        } catch (e: Exception) {
            e.printStackTrace()
            _isRecording.value = false
            Result.failure(e)
        }
    }

    fun cancelRecording() {
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            _isRecording.value = false

            outputFile?.delete()
            outputFile = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun updateDuration() {
        if (_isRecording.value) {
            _recordingDuration.value = (System.currentTimeMillis() - startTime) / 1000
        }
    }

    fun getDurationSeconds(): Int {
        return if (_isRecording.value) {
            ((System.currentTimeMillis() - startTime) / 1000).toInt()
        } else {
            0
        }
    }

    fun release() {
        cancelRecording()
    }
}
