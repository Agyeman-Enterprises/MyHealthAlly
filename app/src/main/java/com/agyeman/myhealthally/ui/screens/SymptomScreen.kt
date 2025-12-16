package com.agyeman.myhealthally.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.agyeman.myhealthally.data.models.solopractice.SymptomScreenResult
import com.agyeman.myhealthally.ui.theme.StatusError

/**
 * Symptom Screen Component
 * 
 * Collects emergency symptom information before sending after-hours messages.
 * This data is sent to Solopractice API for R2: Emergency Intercept enforcement.
 * 
 * Based on SOLOPRACTICE_INTEGRATION_GUIDE.md
 */
@Composable
fun SymptomScreen(
    onComplete: (SymptomScreenResult) -> Unit,
    onCancel: () -> Unit
) {
    var hasChestPain by remember { mutableStateOf(false) }
    var hasShortnessOfBreath by remember { mutableStateOf(false) }
    var hasSevereBleeding by remember { mutableStateOf(false) }
    var hasSevereAllergicReaction by remember { mutableStateOf(false) }
    var hasLossOfConsciousness by remember { mutableStateOf(false) }
    var hasSevereBurn by remember { mutableStateOf(false) }
    var hasSevereHeadInjury by remember { mutableStateOf(false) }
    var hasSevereAbdominalPain by remember { mutableStateOf(false) }
    var otherSymptoms by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onCancel) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = StatusError,
                        modifier = Modifier.size(32.dp)
                    )
                    Text(
                        text = "Emergency Symptoms Check",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = "Please answer these questions to help us determine if your message requires immediate attention.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Divider()

                // Symptom checkboxes
                SymptomCheckbox(
                    text = "Chest pain or pressure",
                    checked = hasChestPain,
                    onCheckedChange = { hasChestPain = it }
                )

                SymptomCheckbox(
                    text = "Shortness of breath or difficulty breathing",
                    checked = hasShortnessOfBreath,
                    onCheckedChange = { hasShortnessOfBreath = it }
                )

                SymptomCheckbox(
                    text = "Severe bleeding that won't stop",
                    checked = hasSevereBleeding,
                    onCheckedChange = { hasSevereBleeding = it }
                )

                SymptomCheckbox(
                    text = "Severe allergic reaction",
                    checked = hasSevereAllergicReaction,
                    onCheckedChange = { hasSevereAllergicReaction = it }
                )

                SymptomCheckbox(
                    text = "Loss of consciousness or fainting",
                    checked = hasLossOfConsciousness,
                    onCheckedChange = { hasLossOfConsciousness = it }
                )

                SymptomCheckbox(
                    text = "Severe burn",
                    checked = hasSevereBurn,
                    onCheckedChange = { hasSevereBurn = it }
                )

                SymptomCheckbox(
                    text = "Severe head injury",
                    checked = hasSevereHeadInjury,
                    onCheckedChange = { hasSevereHeadInjury = it }
                )

                SymptomCheckbox(
                    text = "Severe abdominal pain",
                    checked = hasSevereAbdominalPain,
                    onCheckedChange = { hasSevereAbdominalPain = it }
                )

                // Other symptoms text field
                OutlinedTextField(
                    value = otherSymptoms,
                    onValueChange = { otherSymptoms = it },
                    label = { Text("Other emergency symptoms (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                    placeholder = { Text("Describe any other emergency symptoms...") }
                )

                // Warning if any emergency symptoms are checked
                val hasAnyEmergencySymptom = hasChestPain || hasShortnessOfBreath ||
                    hasSevereBleeding || hasSevereAllergicReaction || hasLossOfConsciousness ||
                    hasSevereBurn || hasSevereHeadInjury || hasSevereAbdominalPain

                if (hasAnyEmergencySymptom) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = StatusError.copy(alpha = 0.1f)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = StatusError
                            )
                            Text(
                                text = "If you are experiencing a medical emergency, please call 911 immediately.",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                color = StatusError
                            )
                        }
                    }
                }

                // Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onCancel,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            onComplete(
                                SymptomScreenResult(
                                    hasChestPain = hasChestPain,
                                    hasShortnessOfBreath = hasShortnessOfBreath,
                                    hasSevereBleeding = hasSevereBleeding,
                                    hasSevereAllergicReaction = hasSevereAllergicReaction,
                                    hasLossOfConsciousness = hasLossOfConsciousness,
                                    hasSevereBurn = hasSevereBurn,
                                    hasSevereHeadInjury = hasSevereHeadInjury,
                                    hasSevereAbdominalPain = hasSevereAbdominalPain,
                                    otherEmergencySymptoms = otherSymptoms.takeIf { it.isNotBlank() }
                                )
                            )
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Continue")
                    }
                }
            }
        }
    }
}

@Composable
private fun SymptomCheckbox(
    text: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
        Text(
            text = text,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f)
        )
    }
}
