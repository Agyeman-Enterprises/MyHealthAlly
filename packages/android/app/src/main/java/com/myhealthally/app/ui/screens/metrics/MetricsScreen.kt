package com.myhealthally.app.ui.screens.metrics

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MetricsScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Health Metrics") }
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
                text = "Your health trends",
                style = MaterialTheme.typography.headlineMedium
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Blood Pressure Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Blood Pressure",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "120/80 mmHg",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Last checked: Today",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Glucose Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Blood Glucose",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "95 mg/dL",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Last checked: Today",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Weight Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Weight",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "175 lbs",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Last checked: Today",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Steps Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Steps",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "8,234 steps",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Today",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

