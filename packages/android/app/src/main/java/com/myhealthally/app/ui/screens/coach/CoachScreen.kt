package com.myhealthally.app.ui.screens.coach

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CoachScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Coach") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "Your care guidance",
                style = MaterialTheme.typography.headlineMedium
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Weekly Summary Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Weekly Summary",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Your health metrics are trending well this week. Continue with your medication routine and daily tracking.",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
            
            // Recommendations Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Recommendations",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Aim for 8 hours of sleep tonight\n• Continue daily medication routine\n• Track blood pressure in the morning",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
            
            // Care Plan Progress Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "3-Month Plan Progress",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = 0.4f,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Phase 1: Reset - 40% complete",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

