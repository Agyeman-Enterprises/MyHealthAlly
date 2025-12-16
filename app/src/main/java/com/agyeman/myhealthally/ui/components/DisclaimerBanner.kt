package com.agyeman.myhealthally.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.agyeman.myhealthally.core.governance.RoleClarity

/**
 * Rule 4: Radical Role Clarity
 * 
 * Disclaimer banner that must appear on clinical interfaces
 * Cannot be dismissed or bypassed
 */
@Composable
fun DisclaimerBanner(
    disclaimerType: com.agyeman.myhealthally.core.governance.DisclaimerType = com.agyeman.myhealthally.core.governance.DisclaimerType.STANDARD,
    modifier: Modifier = Modifier
) {
    val disclaimerText = when (disclaimerType) {
        com.agyeman.myhealthally.core.governance.DisclaimerType.STANDARD -> RoleClarity.STANDARD_DISCLAIMER
        com.agyeman.myhealthally.core.governance.DisclaimerType.EMERGENCY -> RoleClarity.EMERGENCY_DISCLAIMER
        com.agyeman.myhealthally.core.governance.DisclaimerType.AI_ADVISORY -> RoleClarity.AI_ADVISORY_DISCLAIMER
        com.agyeman.myhealthally.core.governance.DisclaimerType.EDUCATIONAL -> """
            The information provided is for educational purposes only and is not a substitute 
            for professional medical advice, diagnosis, or treatment.
        """.trimIndent()
    }
    
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "Disclaimer",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Text(
                text = disclaimerText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

/**
 * Emergency disclaimer banner (red, cannot be dismissed)
 */
@Composable
fun EmergencyDisclaimerBanner(
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFFEBEE) // Light red
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "Emergency Disclaimer",
                tint = Color(0xFFD32F2F), // Red
                modifier = Modifier.size(24.dp)
            )
            
            Text(
                text = RoleClarity.EMERGENCY_DISCLAIMER,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFFC62828), // Dark red
                fontWeight = FontWeight.Bold
            )
        }
    }
}
