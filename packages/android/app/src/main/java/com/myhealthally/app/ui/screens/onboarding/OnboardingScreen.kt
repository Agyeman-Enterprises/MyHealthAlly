package com.myhealthally.app.ui.screens.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.myhealthally.app.ui.theme.Primary
import com.myhealthally.app.ui.theme.PrimaryDark

@Composable
fun OnboardingScreen(
    onGetStarted: () -> Unit,
    onSignIn: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                    colors = listOf(Primary, PrimaryDark)
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
            Spacer(modifier = Modifier.weight(1f))

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "MyHealthAlly",
                    style = MaterialTheme.typography.displayLarge,
                    color = androidx.compose.ui.graphics.Color.White
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Your continuous-care companion.",
                    style = MaterialTheme.typography.displayMedium,
                    color = androidx.compose.ui.graphics.Color.White,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Track your health. Stay guided. Stay supported. Every day.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.9f),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = onGetStarted,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Primary
                    )
                ) {
                    Text("Get Started")
                }

                OutlinedButton(
                    onClick = onSignIn,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = androidx.compose.ui.graphics.Color.White
                    )
                ) {
                    Text("Sign In")
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

