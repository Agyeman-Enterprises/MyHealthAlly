# MyHealthAlly iOS App

SwiftUI iOS app for MyHealthAlly continuous care platform.

## Setup

1. Open `MyHealthAlly.xcodeproj` in Xcode
2. Set your development team in Signing & Capabilities
3. Enable HealthKit capability
4. Update `API_BASE_URL` in `Networking/APIClient.swift` if needed
5. Build and run

## Architecture

- **MVVM**: ViewModels handle business logic
- **Coordinator**: Navigation flow management
- **HealthKitManager**: Health data integration
- **APIClient**: Backend API communication

## Features

- Onboarding & Authentication
- Home dashboard with today's tasks
- Metrics trends with charts
- Coach feed
- Visit requests
- HealthKit integration

