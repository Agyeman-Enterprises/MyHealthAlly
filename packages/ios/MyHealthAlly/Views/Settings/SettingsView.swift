import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    if let user = authManager.currentUser {
                        Text(user.email)
                            .font(.system(size: 17))
                    }
                } header: {
                    Text("Account")
                }
                
                Section {
                    Button(action: {
                        authManager.logout()
                    }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

