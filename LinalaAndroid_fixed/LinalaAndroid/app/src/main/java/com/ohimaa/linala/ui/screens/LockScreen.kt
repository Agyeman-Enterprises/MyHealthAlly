package com.ohimaa.linala.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import com.ohimaa.linala.managers.BiometricAuthManager
import com.ohimaa.linala.managers.BiometricStatus
import com.ohimaa.linala.managers.PINManager
import com.ohimaa.linala.ui.theme.AppColors
import com.ohimaa.linala.ui.theme.BrandConfig
import kotlinx.coroutines.delay

@Composable
fun LockScreen(
    biometricManager: BiometricAuthManager,
    pinManager: PINManager,
    onAuthenticated: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? FragmentActivity
    
    var showPINEntry by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val isLocked by pinManager.isLocked.collectAsState()
    val failedAttempts by pinManager.failedAttempts.collectAsState()
    val requiresPINFallback by biometricManager.requiresPINFallback.collectAsState()
    
    // Auto-trigger biometric on first load
    LaunchedEffect(Unit) {
        if (biometricManager.canAuthenticate() == BiometricStatus.Available && activity != null) {
            delay(300)
            biometricManager.authenticate(
                activity = activity,
                onSuccess = onAuthenticated,
                onError = { error -> errorMessage = error },
                onFallback = { showPINEntry = true }
            )
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    colors = listOf(AppColors.Accent, AppColors.Primary)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(60.dp))
            
            // App Logo/Icon
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = null,
                    modifier = Modifier.size(80.dp),
                    tint = Color.White
                )
                
                Text(
                    text = BrandConfig.appName,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                
                Text(
                    text = BrandConfig.tagline,
                    fontSize = 16.sp,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
            
            // Authentication Section
            if (isLocked) {
                LockoutView(pinManager)
            } else if (showPINEntry || requiresPINFallback) {
                PINEntryView(
                    pinManager = pinManager,
                    onSuccess = {
                        biometricManager.unlockWithPIN()
                        onAuthenticated()
                    },
                    onCancel = { showPINEntry = false }
                )
            } else {
                BiometricPromptSection(
                    biometricManager = biometricManager,
                    pinManager = pinManager,
                    activity = activity,
                    errorMessage = errorMessage,
                    onAuthenticated = onAuthenticated,
                    onError = { errorMessage = it },
                    onFallback = { showPINEntry = true },
                    onShowPIN = { showPINEntry = true }
                )
            }
            
            // Footer
            Text(
                text = "${BrandConfig.providerName} · ${BrandConfig.subtitle}",
                fontSize = 12.sp,
                color = Color.White.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
private fun BiometricPromptSection(
    biometricManager: BiometricAuthManager,
    pinManager: PINManager,
    activity: FragmentActivity?,
    errorMessage: String?,
    onAuthenticated: () -> Unit,
    onError: (String) -> Unit,
    onFallback: () -> Unit,
    onShowPIN: () -> Unit
) {
    val isPINSet by pinManager.isPINSet.collectAsState()
    
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Biometric Button
        Button(
            onClick = {
                activity?.let {
                    biometricManager.authenticate(
                        activity = it,
                        onSuccess = onAuthenticated,
                        onError = onError,
                        onFallback = onFallback
                    )
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.White.copy(alpha = 0.2f)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Fingerprint,
                    contentDescription = "Biometric",
                    modifier = Modifier.size(40.dp),
                    tint = Color.White
                )
                Text(
                    text = "Tap to unlock with biometrics",
                    color = Color.White
                )
            }
        }
        
        // Use PIN Instead
        if (isPINSet) {
            TextButton(onClick = onShowPIN) {
                Text(
                    text = "Use PIN instead",
                    color = Color.White,
                    fontSize = 14.sp
                )
            }
        }
        
        // Error Message
        errorMessage?.let { error ->
            Text(
                text = error,
                color = Color.White,
                fontSize = 12.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun LockoutView(pinManager: PINManager) {
    var remainingTime by remember { mutableStateOf(pinManager.getFormattedRemainingTime()) }
    
    LaunchedEffect(Unit) {
        while (pinManager.getRemainingLockoutTime() > 0) {
            remainingTime = pinManager.getFormattedRemainingTime()
            delay(1000)
        }
        pinManager.clearLockout()
    }
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = null,
            modifier = Modifier.size(50.dp),
            tint = Color.White
        )
        
        Text(
            text = "Too many failed attempts",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
        
        Text(
            text = "Try again in $remainingTime",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
    }
}

@Composable
private fun PINEntryView(
    pinManager: PINManager,
    onSuccess: () -> Unit,
    onCancel: () -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val pinLength = 4
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Text(
            text = "Enter your PIN",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
        
        // PIN Dots
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            repeat(pinLength) { index ->
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(
                            if (index < pin.length) Color.White
                            else Color.White.copy(alpha = 0.3f)
                        )
                )
            }
        }
        
        // Error Message
        errorMessage?.let { error ->
            Text(
                text = error,
                color = Color.Red.copy(alpha = 0.9f),
                fontSize = 12.sp
            )
        }
        
        // Number Pad
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            for (row in 0..2) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    for (col in 1..3) {
                        val number = row * 3 + col
                        NumberButton(
                            number = number,
                            onClick = {
                                if (pin.length < pinLength) {
                                    pin += number.toString()
                                    errorMessage = null
                                    
                                    if (pin.length == pinLength) {
                                        if (pinManager.verifyPIN(pin)) {
                                            onSuccess()
                                        } else {
                                            errorMessage = "Incorrect PIN"
                                            pin = ""
                                        }
                                    }
                                }
                            }
                        )
                    }
                }
            }
            
            // Bottom row: Cancel, 0, Delete
            Row(
                horizontalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                TextButton(
                    onClick = onCancel,
                    modifier = Modifier.size(70.dp)
                ) {
                    Text("Cancel", color = Color.White, fontSize = 12.sp)
                }
                
                NumberButton(number = 0, onClick = {
                    if (pin.length < pinLength) {
                        pin += "0"
                        errorMessage = null
                        
                        if (pin.length == pinLength) {
                            if (pinManager.verifyPIN(pin)) {
                                onSuccess()
                            } else {
                                errorMessage = "Incorrect PIN"
                                pin = ""
                            }
                        }
                    }
                })
                
                IconButton(
                    onClick = {
                        if (pin.isNotEmpty()) {
                            pin = pin.dropLast(1)
                        }
                    },
                    modifier = Modifier.size(70.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Backspace,
                        contentDescription = "Delete",
                        tint = Color.White
                    )
                }
            }
        }
    }
}

@Composable
private fun NumberButton(
    number: Int,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.size(70.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White.copy(alpha = 0.2f)
        ),
        shape = CircleShape
    ) {
        Text(
            text = number.toString(),
            fontSize = 24.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
    }
}
