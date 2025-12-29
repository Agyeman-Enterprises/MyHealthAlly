package com.agyeman.myhealthally.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.agyeman.myhealthally.managers.BiometricAuthManager
import com.agyeman.myhealthally.managers.PINManager
import com.agyeman.myhealthally.ui.navigation.Screen
import com.agyeman.myhealthally.ui.theme.BrandConfig

@Composable
fun LockScreen(navController: NavController) {
    val context = LocalContext.current
    val pinManager = remember { PINManager(context) }
    val biometricManager = remember { BiometricAuthManager(context) }
    
    var pin by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isFirstTimeSetup by remember { mutableStateOf(!pinManager.isPINSet()) }
    var confirmPin by remember { mutableStateOf("") }
    var setupStep by remember { mutableStateOf(0) } // 0 = enter PIN, 1 = confirm PIN
    
    val biometricAvailable = biometricManager.isBiometricAvailable()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // App Logo/Title
        Text(
            text = BrandConfig.APP_NAME,
            style = MaterialTheme.typography.displayMedium,
            color = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = BrandConfig.TAGLINE,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        if (isFirstTimeSetup) {
            // First time setup
            Text(
                text = if (setupStep == 0) "Create Your PIN" else "Confirm Your PIN",
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            OutlinedTextField(
                value = if (setupStep == 0) pin else confirmPin,
                onValueChange = { 
                    if (it.length <= 6) {
                        if (setupStep == 0) pin = it else confirmPin = it
                    }
                },
                label = { Text(if (setupStep == 0) "Enter 4-6 digit PIN" else "Re-enter PIN") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            
            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = errorMessage!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = {
                    when (setupStep) {
                        0 -> {
                            if (pin.length >= 4) {
                                setupStep = 1
                                errorMessage = null
                            } else {
                                errorMessage = "PIN must be at least 4 digits"
                            }
                        }
                        1 -> {
                            if (pin == confirmPin) {
                                pinManager.setPIN(pin)
                                pinManager.saveAuthToken("mock_token_${System.currentTimeMillis()}")
                                navController.navigate(Screen.Dashboard.route) {
                                    popUpTo(Screen.Lock.route) { inclusive = true }
                                }
                            } else {
                                errorMessage = "PINs do not match"
                                confirmPin = ""
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (setupStep == 0) "Next" else "Create PIN")
            }
            
        } else {
            // Login screen
            Text(
                text = "Enter Your PIN",
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            OutlinedTextField(
                value = pin,
                onValueChange = { if (it.length <= 6) pin = it },
                label = { Text("PIN") },
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            
            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = errorMessage!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = {
                    if (pinManager.validatePIN(pin)) {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Lock.route) { inclusive = true }
                        }
                    } else {
                        errorMessage = "Incorrect PIN"
                        pin = ""
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Unlock")
            }
            
            if (biometricAvailable && pinManager.isBiometricEnabled()) {
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedButton(
                    onClick = {
                        // Biometric auth would go here
                        // For now, just navigate
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Lock.route) { inclusive = true }
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Fingerprint, contentDescription = "Biometric")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Use Biometric")
                }
            }
        }
    }
}
