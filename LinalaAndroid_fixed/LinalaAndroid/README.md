# Lina'la / MyHealthAlly Android App

Patient engagement Android app for functional medicine practices.

## 🏗️ Project Structure

```
LinalaAndroid/
├── app/
│   ├── build.gradle.kts          # App build config with product flavors
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/ohimaa/linala/
│       │   │   ├── MainActivity.kt
│       │   │   ├── data/models/
│       │   │   │   └── VoiceMessageModels.kt
│       │   │   ├── managers/
│       │   │   │   ├── AudioRecordingManager.kt
│       │   │   │   ├── BiometricAuthManager.kt
│       │   │   │   └── PINManager.kt
│       │   │   └── ui/
│       │   │       ├── Navigation.kt
│       │   │       ├── screens/
│       │   │       │   ├── DashboardScreen.kt
│       │   │       │   ├── LockScreen.kt
│       │   │       │   ├── VoiceMessageListScreen.kt
│       │   │       │   └── VoiceRecordingScreen.kt
│       │   │       └── theme/
│       │   │           ├── BrandConfig.kt
│       │   │           ├── Color.kt
│       │   │           ├── Theme.kt
│       │   │           └── Type.kt
│       │   └── res/
│       │       ├── values/
│       │       │   ├── colors.xml
│       │       │   ├── strings.xml
│       │       │   └── themes.xml
│       │       └── xml/
│       │           ├── backup_rules.xml
│       │           ├── data_extraction_rules.xml
│       │           └── network_security_config.xml
│       ├── linala/               # Lina'la flavor resources (optional)
│       └── myhealthally/         # MyHealthAlly flavor resources (optional)
├── build.gradle.kts              # Project-level build config
└── settings.gradle.kts
```

## 🎨 Product Flavors

One codebase produces two apps:

| Flavor | App Name | Package Name | Colors |
|--------|----------|--------------|--------|
| `linala` | Lina'la | `com.ohimaa.linala` | Forest Green + Coral |
| `myhealthally` | MyHealthAlly | `com.agyeman.myhealthally` | Teal |

### Build Commands

```bash
# Build Lina'la (Debug)
./gradlew assembleLinalaDebug

# Build MyHealthAlly (Debug)
./gradlew assembleMyhealthallyDebug

# Build Lina'la (Release)
./gradlew assembleLinalaRelease

# Build MyHealthAlly (Release)
./gradlew assembleMyhealthallyRelease

# Build all variants
./gradlew assemble
```

## 🔐 Security Features

### Biometric Authentication
- Fingerprint, Face, and Iris recognition
- Automatic fallback to PIN
- Lockout after 5 failed attempts

### PIN Manager
- 4-6 digit PIN with SHA-256 hashing
- EncryptedSharedPreferences storage
- 5-minute lockout on max attempts

### App Lock
- Locks when app goes to background
- Requires re-authentication on return

## 🎤 Voice Recording

- 60-second maximum duration
- AAC encoding (M4A format)
- Real-time audio level visualization
- Waveform display during recording

## 📦 Dependencies

```kotlin
// Core
androidx.core:core-ktx:1.12.0
androidx.lifecycle:lifecycle-runtime-ktx:2.7.0
androidx.activity:activity-compose:1.8.2

// Compose
androidx.compose:compose-bom:2024.01.00
androidx.compose.material3:material3
androidx.navigation:navigation-compose:2.7.6

// Security
androidx.biometric:biometric:1.1.0
androidx.security:security-crypto:1.1.0-alpha06

// Networking
com.squareup.retrofit2:retrofit:2.9.0
com.squareup.okhttp3:okhttp:4.12.0

// Firebase
com.google.firebase:firebase-bom:32.7.0
com.google.firebase:firebase-messaging-ktx

// Media
androidx.media3:media3-exoplayer:1.2.1

// Health
androidx.health.connect:connect-client:1.1.0-alpha06
```

## 🚀 Setup Instructions

### 1. Open in Android Studio

```bash
# Clone or copy the project
cd LinalaAndroid
# Open in Android Studio
```

### 2. Configure Firebase

1. Create Firebase project
2. Add Android apps for both package names:
   - `com.ohimaa.linala`
   - `com.agyeman.myhealthally`
3. Download `google-services.json` files
4. Place in `app/src/linala/` and `app/src/myhealthally/`

### 3. Build Variant Selection

In Android Studio:
1. **Build → Select Build Variant**
2. Choose: `linalaDebug` or `myhealthallyDebug`

### 4. Run

- Select a device/emulator
- Click Run ▶️

## 📱 Screens Implemented

| Screen | Status | Description |
|--------|--------|-------------|
| Lock Screen | ✅ | Biometric + PIN authentication |
| Dashboard | ✅ | Home with quick actions, tasks, messages |
| Voice Recording | ✅ | 60-sec recorder with waveform |
| Voice Message List | ✅ | List of sent messages |
| Voice Message Detail | 🔲 | Transcript, AI summary, playback |
| Vitals | 🔲 | Blood pressure, glucose, weight, etc. |
| Medications | 🔲 | Medication tracker |
| Care Plan | 🔲 | Goals, instructions, appointments |
| Settings | 🔲 | PIN setup, notifications, profile |

## 🎨 Theme Switching

The app automatically uses the correct colors based on build flavor:

```kotlin
// Access current brand
BrandConfig.appName       // "Lina'la" or "MyHealthAlly"
BrandConfig.providerName  // "Ohimaa GU" or "Your Healthcare Provider"

// Access theme colors
AppColors.Primary         // Forest Green or Teal
AppColors.Accent          // Coral or Light Teal
AppColors.GradientStart   // For gradients
AppColors.GradientEnd
```

## 🔔 Push Notifications

Configure in Firebase Cloud Messaging:

```kotlin
// Notification channels
- voice_message_processed
- triage_update
- care_team_response
- medication_reminder
- appointment_reminder
- care_plan_update
```

## 📋 Required Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## 🧪 Testing

```bash
# Run unit tests
./gradlew testLinalaDebugUnitTest

# Run instrumented tests
./gradlew connectedLinalaDebugAndroidTest
```

## 📦 Release Build

1. Create signing keystore
2. Configure in `app/build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        storeFile = file("keystore.jks")
        storePassword = "..."
        keyAlias = "..."
        keyPassword = "..."
    }
}
```

3. Build:

```bash
./gradlew assembleLinalaRelease
./gradlew assembleMyhealthallyRelease
```

## 📞 Support

- **Lina'la**: support@ohimaa.gu
- **MyHealthAlly**: support@myhealthally.com

---

*One codebase, two brands, zero duplicate work!* 🎉
