package com.myhealthally.app.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Home") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "Hi there,",
                style = MaterialTheme.typography.displaySmall
            )
            Text(
                text = "Here's your plan for today.",
                style = MaterialTheme.typography.bodyLarge
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Placeholder for tasks and metrics
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text("Today's priorities")
                    // TODO: Add task list
                }
            }
        }
    }
}

