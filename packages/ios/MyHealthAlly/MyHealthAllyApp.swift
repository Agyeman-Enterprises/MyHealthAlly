import SwiftUI

@main
struct MyHealthAllyApp: App {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
        }
    }
}

