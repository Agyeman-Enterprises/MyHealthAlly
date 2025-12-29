package com.agyeman.myhealthally

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.agyeman.myhealthally.managers.PINManager
import com.agyeman.myhealthally.ui.navigation.AppNavigation
import com.agyeman.myhealthally.ui.navigation.Screen
import com.agyeman.myhealthally.ui.theme.MyHealthAllyTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        val pinManager = PINManager(this)
        val startDestination = if (pinManager.isLoggedIn()) {
            Screen.Dashboard.route
        } else {
            Screen.Lock.route
        }

        setContent {
            MyHealthAllyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    AppNavigation(
                        navController = navController,
                        startDestination = startDestination
                    )
                }
            }
        }
    }
}
